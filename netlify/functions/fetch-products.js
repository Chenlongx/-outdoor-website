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
