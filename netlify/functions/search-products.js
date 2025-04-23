const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event, context) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  const { q } = event.queryStringParameters || {}; // 从请求中获取查询参数

  try {
    // 基于关键词筛选产品
    let query = supabase.from('products').select(`
      *,
      product_categories (
        categories (
          name
        )
      )
    `);

    if (q) {
      // 搜索产品名称或描述中包含关键词的产品
      query = query.ilike('name', `%${q}%`).or(`description.ilike.%${q}%`);
    }

    // 执行查询
    const { data: products, error } = await query;

    if (error) throw error;

    // 处理产品数据，提取类别
    const processedProducts = products.map(product => {
      const categoryList =
        product.product_categories?.map(pc => pc.categories?.name).filter(Boolean) || [];

      return {
        ...product,
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
