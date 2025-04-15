// const { createClient } = require('@supabase/supabase-js');

// exports.handler = async function(event, context) {
//     try {
//         const supabaseUrl = process.env.SUPABASE_URL;
//         const supabaseKey = process.env.SUPABASE_KEY;
//         const supabase = createClient(supabaseUrl, supabaseKey);

//         // 获取所有产品及其分类关联
//         const { data: products, error: productsError } = await supabase
//             .from('products')
//             .select(`
//                 *,
//                 product_categories (
//                     category_id,
//                     categories (
//                         id,
//                         name
//                     )
//                 )
//             `);

//         if (productsError) {
//             throw productsError;
//         }

//         // 处理返回的数据
//         const processedProducts = products.map(product => {
//             const productCategories = product.product_categories || [];
//             const categoryNames = productCategories.map(pc => pc.categories.name);
            
//             // 根据产品类型设置分类
//             let category = null;
//             let subcategory = null;

//             // 根据产品类型设置主分类和子分类
//             if (product.producttype.toLowerCase().includes('tent')) {
//                 category = '野营';
//                 subcategory = '帐篷';
//             } else if (product.producttype.toLowerCase().includes('backpack')) {
//                 category = '远足';
//                 subcategory = '背包';
//             } else if (product.producttype.toLowerCase().includes('sleeping')) {
//                 category = '野营';
//                 subcategory = '睡袋';
//             } else if (product.producttype.toLowerCase().includes('boot')) {
//                 category = '鞋类';
//                 subcategory = '登山靴';
//             }

//             return {
//                 ...product,
//                 category: category || categoryNames[0] || '未分类',
//                 subcategory: subcategory || categoryNames[1] || null,
//                 categories: categoryNames
//             };
//         });

//         return {
//             statusCode: 200,
//             headers: {
//                 "Access-Control-Allow-Origin": "*",
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(processedProducts)
//         };
//     } catch (error) {
//         console.error('Error fetching products:', error);
//         return {
//             statusCode: 500,
//             headers: {
//                 "Access-Control-Allow-Origin": "*",
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ error: 'Failed to fetch products' })
//         };
//     }
// };




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
