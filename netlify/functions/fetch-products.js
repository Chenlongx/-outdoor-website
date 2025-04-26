const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event, context) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  try {
    // 查询所有字段，并关联分类名称
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories (
          categories (
            name
          )
        )
      `);

    if (error) throw error;

    const processedProducts = products.map(product => {
      const categoryList =
        product.product_categories?.map(pc => pc.categories?.name).filter(Boolean) || [];

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
      
      return {
        ...product,
        final_price: finalPrice.toFixed(2),   // ✅ 折扣后价格
        discount_percent: Math.round(discountPercent), // ✅ 折扣百分比，四舍五入
        categories: categoryList,
        category: categoryList[0] || 'Uncategorized',
        subcategory: categoryList[1] || null
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(processedProducts)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch products' })
    };
  }
};
