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
        product_details_url,
        details,
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

    // 处理产品数据，提取分类信息
    const categoryList = product.product_categories?.map(pc => pc.categories?.name).filter(Boolean) || [];

    const processedProduct = {
      ...product,
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
