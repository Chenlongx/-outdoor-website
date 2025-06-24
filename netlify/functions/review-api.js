const Busboy = require('busboy');
const fs = require('fs');
const os = require('os');
const tempDir = os.tmpdir();
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 初始化 Supabase 客户端
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BUCKET = 'review-images';

// 解析 multipart/form-data
async function parseMultipartForm(event) {
    return new Promise((resolve, reject) => {
        const busboy = new Busboy({ headers: event.headers });
        const fields = {};
        const files = [];
        const fileWrites = [];

        busboy.on('field', (fieldname, value) => {
            fields[fieldname] = value;
        });

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            const filePath = path.join(tempDir, crypto.randomUUID() + path.extname(filename.filename || filename));
            const writeStream = fs.createWriteStream(filePath);
            file.pipe(writeStream);

            const finished = new Promise((res, rej) => {
                writeStream.on('finish', () => {
                    files.push({
                        fieldname,
                        path: filePath,
                        filename: filename.filename || filename,
                        mimetype
                    });
                    res();
                });
                writeStream.on('error', rej);
            });

            fileWrites.push(finished);
        });

        busboy.on('finish', async () => {
            try {
                await Promise.all(fileWrites);
                resolve({ fields, files });
            } catch (err) {
                reject(err);
            }
        });

        busboy.on('error', (err) => reject(err));

        const bodyBuffer = event.isBase64Encoded
            ? Buffer.from(event.body, 'base64')
            : Buffer.from(event.body);
        busboy.end(bodyBuffer);
    });
}

// 数据库操作函数
async function addReview(productId, rating, body, imageUrls, username) {
    return supabase
        .from('reviews')
        .insert([{ product_id: productId, rating, body, image_urls: imageUrls, username }]);
}

async function getReviewsByProduct(productId) {
    return supabase
        .from('reviews')
        .select('id,rating,body,image_urls,created_at,username,is_verified')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
}

// 现有函数：获取单个产品评分 - 优化返回信息
async function getProductRating(productId) {
    const { data: recs, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);
    if (error) throw error;

    const count = recs.length;
    const sum = recs.reduce((s, r) => s + (r.rating || 0), 0);
    const average = count ? sum / count : 0;

    // ✅ 只返回平均分和评论数量
    return { average, count };
}

// ✅ 新增函数：批量获取产品评分 - 优化返回信息
async function getProductRatingsBatch(productIds) {
    const { data: recs, error } = await supabase
        .from('reviews')
        .select('product_id, rating') // 同时选择 product_id 以便分组
        .in('product_id', productIds); // 使用 in 操作符批量查询

    if (error) throw error;

    const ratingsMap = {}; // 用于存储 { productId: { average, count } }

    // 初始化 ratingsMap，确保即使没有评论的产品也返回默认值
    productIds.forEach(id => {
        ratingsMap[id] = { average: 0, count: 0 };
    });

    recs.forEach(rec => {
        const productId = rec.product_id;
        const rating = rec.rating || 0;

        // 如果该产品 ID 已经存在于映射中，则更新数据
        if (ratingsMap[productId]) {
            ratingsMap[productId].count++;
            ratingsMap[productId].average += rating; // 累加评分用于计算平均值
        }
    });

    // 计算最终的平均值
    for (const id in ratingsMap) {
        if (ratingsMap[id].count > 0) {
            ratingsMap[id].average = ratingsMap[id].average / ratingsMap[id].count;
        }
    }

    // ✅ 只返回 average 和 count
    return ratingsMap;
}

async function updateReview(id, rating, body, imageUrls) {
    return supabase
        .from('reviews')
        .update({ rating, body, image_urls: imageUrls })
        .eq('id', id);
}

async function deleteReview(id) {
    return supabase
        .from('reviews')
        .delete()
        .eq('id', id);
}

const RECAPTCHA_VERIFY_URL =
    process.env.RECAPTCHA_USE_NETLAND === 'true'
        ? 'https://recaptcha.net/recaptcha/api/siteverify'
        : 'https://www.google.com/recaptcha/api/siteverify';

async function verifyRecaptchaToken(token) {
    if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV] skip reCAPTCHA check');
        return true;
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
        console.warn('Missing RECAPTCHA_SECRET_KEY, skipping verification');
        return true;
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(RECAPTCHA_VERIFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ secret, response: token }).toString(),
            signal: controller.signal
        });
        clearTimeout(timeout);

        const data = await res.json();
        console.log('reCAPTCHA v2 verify result:', data);

        return data.success === true;
    } catch (err) {
        console.error('reCAPTCHA validation error:', err);
        return false;
    }
}

// Lambda Handler
exports.handler = async (event) => {
    try {
        const method = event.httpMethod;
        const qs = event.queryStringParameters || {};

        switch (method) {
            case 'GET':
                if (qs.rating === 'true') {
                    if (qs.productIds) {
                        const productIdsArray = qs.productIds.split(',');
                        const stats = await getProductRatingsBatch(productIdsArray);
                        return { statusCode: 200, body: JSON.stringify(stats) };
                    } else if (qs.productId) {
                        const stats = await getProductRating(qs.productId);
                        return { statusCode: 200, body: JSON.stringify(stats) };
                    } else {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({ error: 'Missing productId or productIds for rating query' })
                        };
                    }
                } else {
                    const { data, error } = await getReviewsByProduct(qs.productId);
                    if (error) throw error;
                    return { statusCode: 200, body: JSON.stringify(data) };
                }

            case 'POST': {
                const contentType = (event.headers['content-type'] || event.headers['Content-Type'] || '').toLowerCase();

                let productId, rating, text, imageUrls = [], username = 'Anonymous';

                if (contentType.includes('multipart/form-data')) {
                    const { fields, files } = await parseMultipartForm(event);

                    const recaptchaToken = fields.recaptcha;
                    const isValid = await verifyRecaptchaToken(recaptchaToken);
                    if (!isValid) {
                        return {
                            statusCode: 403,
                            body: JSON.stringify({ error: 'reCAPTCHA verification failed' })
                        };
                    }

                    if (!fields || !fields.productId || !fields.rating || typeof fields.body !== 'string' || fields.body.trim() === '') {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({ error: 'Missing required fields: productId, rating, or body' })
                        };
                    }

                    productId = fields.productId;
                    rating = parseInt(fields.rating, 10);
                    text = fields.body;
                    username = fields.username || 'Anonymous';

                    const incoming = files.filter(f => f.fieldname === 'images').slice(0, 5);
                    for (let file of incoming) {
                        console.log('Processing file:', { filename: file.filename, path: file.path, mimetype: file.mimetype });
                        let webpPath = null;
                        try {
                            webpPath = path.join(tempDir, crypto.randomUUID() + '.webp');
                            await sharp(file.path)
                                .webp({ quality: 80 })
                                .toFile(webpPath);

                            const buffer = fs.readFileSync(webpPath);
                            const key = `reviews/${productId}/${crypto.randomUUID()}.webp`;

                            const { data: uploadData, error: uploadErr } = await supabase
                                .storage
                                .from(BUCKET)
                                .upload(key, buffer, { cacheControl: '3600', upsert: false, contentType: 'image/webp' });
                            if (uploadErr) {
                                console.error('Supabase upload error:', uploadErr);
                                return {
                                    statusCode: 500,
                                    body: JSON.stringify({ error: `Failed to upload file ${file.filename}: ${uploadErr.message}` })
                                };
                            }
                            console.log('File uploaded:', uploadData.path);

                            const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);
                            console.log('Public URL:', publicUrl);
                            imageUrls.push(publicUrl);
                        } catch (fileErr) {
                            console.error('File processing error:', fileErr);
                            return {
                                statusCode: 500,
                                body: JSON.stringify({ error: `Error processing file ${file.filename}: ${fileErr.message}` })
                            };
                        } finally {
                            const cleanupFile = async (filePath) => {
                                if (filePath && fs.existsSync(filePath)) {
                                    try {
                                        await fs.promises.unlink(filePath);
                                        console.log('Cleaned up file:', filePath);
                                    } catch (cleanupErr) {
                                        console.error('Error cleaning up file:', cleanupErr);
                                    }
                                }
                            };
                            await cleanupFile(file.path);
                            await cleanupFile(webpPath);
                        }
                    }
                } else {
                    const bodyData = JSON.parse(event.body);

                    const recaptchaToken = bodyData.recaptcha;
                    const isValid = await verifyRecaptchaToken(recaptchaToken);
                    if (!isValid) {
                        return {
                            statusCode: 403,
                            body: JSON.stringify({ error: 'reCAPTCHA verification failed' })
                        };
                    }

                    if (!bodyData.productId || !bodyData.rating || !bodyData.body) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({ error: 'Missing required fields: productId, rating, or body' })
                        };
                    }
                    productId = bodyData.productId;
                    rating = parseInt(bodyData.rating, 10);
                    text = bodyData.body;
                    imageUrls = bodyData.imageUrls || [];
                    username = bodyData.username || 'Anonymous';
                }

                console.log('Saving review:', { productId, rating, text, imageUrls });
                const { data, error } = await addReview(productId, rating, text, imageUrls, username);
                if (error) {
                    console.error('Supabase insert error:', error);
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ error: `Failed to save review: ${error.message}` })
                    };
                }
                console.log('Review saved:', data);

                return {
                    statusCode: 200,
                    body: JSON.stringify({ data, success: true })
                };
            }

            case 'PUT':
                const upd = JSON.parse(event.body);
                const { data: d2, error: e2 } = await updateReview(upd.id, upd.rating, upd.body, upd.imageUrls);
                if (e2) {
                    console.error('Supabase update error:', e2);
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ error: `Failed to update review: ${e2.message}` })
                    };
                }
                return { statusCode: 200, body: JSON.stringify(d2) };

            case 'DELETE':
                const { data: d3, error: e3 } = await deleteReview(qs.id);
                if (e3) {
                    console.error('Supabase delete error:', e3);
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ error: `Failed to delete review: ${e3.message}` })
                    };
                }
                return { statusCode: 200, body: JSON.stringify(d3) };

            default:
                return {
                    statusCode: 405,
                    body: JSON.stringify({ error: 'Method Not Allowed' })
                };
        }
    } catch (err) {
        console.error('Handler error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Server error: ${err.message}` })
        };
    }
};