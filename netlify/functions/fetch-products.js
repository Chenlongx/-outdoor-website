const { createClient } = require('@supabase/supabase-js');
const zlib = require('zlib');

// 1. 在模块顶层初始化 Supabase 客户端（冷启动时执行一次）
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 2. 简单内存缓存，30 秒内复用同一次查询结果 + 压缩体
let cache = null;
let cacheTs = 0;

/**
 * 异步 Gzip 压缩
 * @param {Buffer|string} buf 
 * @returns {Promise<Buffer>}
 */
function gzipAsync(buf) {
  return new Promise((resolve, reject) => {
    zlib.gzip(buf, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

exports.handler = async function(event, context) {
  // 30 秒内直接返回缓存
  if (cache && Date.now() - cacheTs < 30_000) {
    return cache;
  }

  try {
    // 3. 从 Supabase 查询原始数据
    const { data: rows, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        discount,
        description,
        image_url,
        stock,
        product_categories (
          categories ( name )
        ),
        variant_options
      `);
    if (error) throw error;

    // 4. 处理每条记录：分类、折后价、折扣百分比
    const processed = rows.map(p => {
      const categoryList = p.product_categories
        ?.map(pc => pc.categories?.name)
        .filter(Boolean) || [];
      const price = parseFloat(p.price) || 0;
      const dr = parseFloat(p.discount);
      let finalPrice = price, discountPercent = 0;

      if (!isNaN(dr)) {
        if (dr > 1) {
          finalPrice = price * (1 - dr / 100);
          discountPercent = dr;
        } else {
          finalPrice = price * dr;
          discountPercent = (1 - dr) * 100;
        }
      }

      return {
        id: p.id,
        name: p.name,
        description: p.description || '',
        image_url: p.image_url,
        price: price.toFixed(2), 
        final_price: finalPrice.toFixed(2),
        discount_percent: Math.round(discountPercent),
        stock: p.stock, 
        categories: categoryList,
        category: categoryList[0] || 'Uncategorized',
        subcategory: categoryList[1] || null,
        variant_options: p.variant_options
      };
    });

    // 5. 序列化并异步 Gzip
    const json = JSON.stringify(processed);
    const gzipped = await gzipAsync(json);

    // 6. 构造响应并缓存
    const response = {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
        // 浏览器缓存 60s，CDN 边缘节点缓存 300s
        'Cache-Control': 'public, max-age=60, s-maxage=300'
      },
      body: gzipped.toString('base64')
    };

    cache = response;
    cacheTs = Date.now();
    return response;

  } catch (err) {
    console.error('Error fetching products:', err);

    // 错误时也返回 gzip，但状态码改为 500
    const errJson = JSON.stringify({ error: err.message });
    const gzippedErr = await gzipAsync(errJson);
    return {
      statusCode: 500,
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
        'Cache-Control': 'public, max-age=60, s-maxage=300'
      },
      body: gzippedErr.toString('base64')
    };
  }
};