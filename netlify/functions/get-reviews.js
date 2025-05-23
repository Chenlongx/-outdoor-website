const Busboy = require('busboy');
const fs = require('fs');
const os = require('os');
const tempDir = os.tmpdir();
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

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
async function addReview(productId, rating, body, imageUrls) {
  return supabase
    .from('reviews')
    .insert([{ product_id: productId, rating, body, image_urls: imageUrls }]);
}

async function getReviewsByProduct(productId) {
  return supabase
    .from('reviews')
    .select('id,rating,body,image_urls,created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
}

async function getProductRating(productId) {
  const { data: recs, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);
  if (error) throw error;
  const count = recs.length;
  const sum = recs.reduce((s, r) => s + (r.rating || 0), 0);

  const average = count ? sum / count : 0;

  // 每星级数量统计
  const stars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  recs.forEach(r => {
    const rt = Math.round(r.rating);
    if (stars[rt] !== undefined) stars[rt]++;
  });

  return { average, count, stars };

  // return { average: count ? sum / count : 0, count };
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

// Lambda Handler
exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    const qs = event.queryStringParameters || {};
    let result;

    // console.log('=== New request ===');
    // console.log('Method:', method);
    // console.log('Headers:', event.headers);
    // console.log('isBase64Encoded:', event.isBase64Encoded);
    // console.log('Raw body (first 200 chars):', typeof event.body === 'string' ? event.body.substring(0, 200) : event.body);

    switch (method) {
      case 'GET':
        if (qs.rating === 'true') {
          const stats = await getProductRating(qs.productId);
          return { statusCode: 200, body: JSON.stringify(stats) };
        } else {
          const { data, error } = await getReviewsByProduct(qs.productId);
          if (error) throw error;
          return { statusCode: 200, body: JSON.stringify(data) };
        }

      case 'POST': {
        const contentType = (event.headers['content-type'] || event.headers['Content-Type'] || '').toLowerCase();
        // console.log('Content-Type:', contentType);

        let productId, rating, text, imageUrls = [];

        if (contentType.includes('multipart/form-data')) {
          const { fields, files } = await parseMultipartForm(event);
          // console.log('Parsed fields:', fields);
          // console.log('Parsed files:', files);

          if (!fields || !fields.productId || !fields.rating || typeof fields.body !== 'string' || fields.body.trim() === '') {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: 'Missing required fields: productId, rating, or body' })
            };
          }

          productId = fields.productId;
          rating = parseInt(fields.rating, 10);
          text = fields.body;

          const incoming = files.filter(f => f.fieldname === 'images').slice(0, 5);
          for (let file of incoming) {
            console.log('Processing file:', { filename: file.filename, path: file.path, mimetype: file.mimetype });
            let webpPath = null;
            try {
              // 使用 sharp 压缩并转为 WebP
              webpPath = path.join(tempDir, crypto.randomUUID() + '.webp');
              await sharp(file.path)
                .webp({ quality: 80 })
                .toFile(webpPath);
              // console.log('Converted to WebP:', webpPath);

              // 读取 WebP 文件
              const buffer = fs.readFileSync(webpPath);
              const key = `reviews/${productId}/${crypto.randomUUID()}.webp`;
              // console.log('Uploading to Supabase:', { bucket: BUCKET, key });

              // 上传到 Supabase
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

              // 获取公开 URL
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
              // 异步清理临时文件，避免 EBUSY
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
          console.log('Parsed JSON body:', bodyData);
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
        }

        console.log('Saving review:', { productId, rating, text, imageUrls });
        const { data, error } = await addReview(productId, rating, text, imageUrls);
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