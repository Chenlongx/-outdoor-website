const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event, context) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  // 获取 URL 查询参数中的产品 ID
  const productId = event.queryStringParameters.id;

  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Product ID is required' })
    };
  }

  try {
    // 查询指定 ID 的产品，并关联分类信息
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
        product_categories (
          categories (
            name
          )
        )
      `)
      .eq('id', productId)  // 直接使用传入的完整 UUID 进行查询
      .single();  // 只取一个结果

    if (error) {
      console.error('Error fetching product:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch product details' })
      };
    }
    
    // 计算折扣价，假设 discount 是一个百分比（例如：20 表示 20% 的折扣）
      // 处理价格和折扣
      const price = parseFloat(product.price) || 0;
      const discountRate = parseFloat(product.discount);

      let finalPrice = price;
      let discountPercent = 0;

      if (!isNaN(discountRate)) {
        if (discountRate > 1) {
          // 如果 discount 是百分数 (比如 20)，换成 0.8
          finalPrice = price * (1 - discountRate / 100);
          discountPercent = discountRate;
        } else {
          // 如果 discount 已经是比例 (比如 0.8)，直接乘
          finalPrice = price * discountRate;
          discountPercent = (1 - discountRate) * 100;
        }
      }

    // 输出折扣价
    console.log('折扣后的价格:', finalPrice.toFixed(2));
    
    // 处理产品数据，提取分类信息
    const categoryList = product.product_categories?.map(pc => pc.categories?.name).filter(Boolean) || [];

    const processedProduct = {
      ...product,
      final_price: finalPrice.toFixed(2),   // ✅ 折扣后价格
      discount_percent: Math.round(discountPercent), // ✅ 折扣百分比，四舍五入
      categories: categoryList,
      category: categoryList[0] || 'Uncategorized',
      subcategory: categoryList[1] || null
    };



    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(processedProduct)
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch product details' })
    };
  }
};
