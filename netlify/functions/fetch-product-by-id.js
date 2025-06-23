const { createClient } = require('@supabase/supabase-js');
const zlib = require('zlib');

exports.handler = async function (event, context) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  const productId = event.queryStringParameters.id;
  if (!productId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Product ID is required' }) };
  }

  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        name,
        price,
        description,
        image_url,
        producttype,
        stock,
        specifications,
        package_includes,
        discount,
        product_details_url,
        details,
        variant_options,
        video_url,
        product_categories (
          categories (
            name
          )
        )
      `)
      .eq('id', productId)
      .single();

    if (error) throw error;

    // —— 1. 计算折扣价格 和 折扣百分比 ——
    const price = parseFloat(product.price) || 0;
    const discountRate = parseFloat(product.discount);
    let finalPrice = price;
    let discountPercent = 0;

    if (!isNaN(discountRate)) {
      if (discountRate > 1) {
        // discount 以百分数传入（比如 20 表示 20%）
        finalPrice = price * (1 - discountRate / 100);
        discountPercent = discountRate;
      } else {
        // discount 已经是小数比例（比如 0.8 表示 80%）
        finalPrice = price * discountRate;
        discountPercent = (1 - discountRate) * 100;
      }
    }

    // —— 2. 提取分类列表 ——
    const categoryList = product.product_categories
      ?.map(pc => pc.categories?.name)
      .filter(Boolean) || [];

    // —— 3. 构造最终输出对象 ——
    const processedProduct = {
      ...product,
      final_price: finalPrice.toFixed(2),
      discount_percent: Math.round(discountPercent),
      categories: categoryList,
      category: categoryList[0] || 'Uncategorized',
      subcategory: categoryList[1] || null
    };

    // 序列化并 gzip 压缩
    const json = JSON.stringify(processedProduct);
    const compressed = zlib.gzipSync(json);

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
        'Cache-Control': 'public, max-age=60',
      },
      body: compressed.toString('base64'),
    };
  } catch (err) {
    console.error(err);
    const errorJson = JSON.stringify({ error: 'Failed to fetch product details' });
    const compressedErr = zlib.gzipSync(errorJson);
    return {
      statusCode: 500,
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
      body: compressedErr.toString('base64'),
    };
  }
};