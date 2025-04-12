7// // const { createClient } = require('@supabase/supabase-js');

// // exports.handler = async (event) => {
// //   // 处理 OPTIONS 预检请求
// //   if (event.httpMethod === "OPTIONS") {
// //     return {
// //       statusCode: 200,
// //       headers: {
// //         "Access-Control-Allow-Origin": "*",
// //         "Access-Control-Allow-Headers": "Content-Type",
// //         "Access-Control-Allow-Methods": "GET, OPTIONS", // 明确允许 GET 方法
// //       },
// //       body: "OK",
// //     };
// //   }

// //   // 初始化 Supabase 客户端
// //   const supabase = createClient(
// //     process.env.SUPABASE_URL,  // 使用新变量名
// //     process.env.SUPABASE_KEY   // 使用新变量名
// //   );

// //   try {
// //     // 查询数据
// //     const { data, error } = await supabase
// //       .from('products')
// //       .select('*');

// //     // 打印查询结果（调试关键！）
// //     console.log("Supabase 返回数据:", data);
// //     console.log("Supabase 返回错误:", error);

// //     if (error) throw error;

// //     // 返回数据给客户端
// //     return {
// //       statusCode: 200,
// //       headers: {
// //         "Access-Control-Allow-Origin": "*",
// //         "Content-Type": "application/json", // 明确返回 JSON 类型
// //       },
// //       body: JSON.stringify(data),
// //     };
// //   } catch (error) {
// //     // 打印详细错误日志
// //     console.error("捕获到错误:", error);
// //     return {
// //       statusCode: 500,
// //       headers: {
// //         "Access-Control-Allow-Origin": "*",
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify({ error: error.message }),
// //     };
// //   }
// // };



// const { createClient } = require('@supabase/supabase-js');

// exports.handler = async (event) => {
//   // 处理 OPTIONS 预检请求
//   if (event.httpMethod === "OPTIONS") {
//     return {
//       statusCode: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Headers": "Content-Type",
//         "Access-Control-Allow-Methods": "GET, OPTIONS",
//       },
//       body: "OK",
//     };
//   }

//   // 初始化 Supabase 客户端
//   const supabase = createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_KEY
//   );

//   try {
//     // 查询 products 表并关联 product_categories 和 categories
//     const { data, error } = await supabase
//       .from('products')
//       .select(`
//         id,
//         name,
//         price,
//         stock,
//         producttype,
//         image_url,
//         description,
//         created_at,
//         user_id,
//         product_categories (
//           categories (id, name, description)
//         )
//       `);

//     // 打印查询结果（调试用）
//     console.log("Supabase 返回数据:", JSON.stringify(data, null, 2));
//     console.log("Supabase 返回错误:", error);

//     if (error) throw error;

//     // 格式化数据，提取分类名称
//     const formattedData = data.map(product => ({
//       ...product,
//       categories: product.product_categories.map(pc => pc.categories.name),
//     }));

//     // 返回格式化后的数据给客户端
//     return {
//       statusCode: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formattedData),
//     };
//   } catch (error) {
//     // 打印详细错误日志
//     console.error("捕获到错误:", error);
//     return {
//       statusCode: 500,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ error: error.message }),
//     };
//   }
// };






const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 获取所有产品及其分类关联
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select(`
                *,
                product_categories (
                    category_id,
                    categories (
                        id,
                        name
                    )
                )
            `);

        if (productsError) {
            throw productsError;
        }

        // 处理返回的数据
        const processedProducts = products.map(product => {
            const productCategories = product.product_categories || [];
            const categoryNames = productCategories.map(pc => pc.categories.name);
            
            // 根据产品类型设置分类
            let category = null;
            let subcategory = null;

            // 根据产品类型设置主分类和子分类
            if (product.producttype.toLowerCase().includes('tent')) {
                category = '野营';
                subcategory = '帐篷';
            } else if (product.producttype.toLowerCase().includes('backpack')) {
                category = '远足';
                subcategory = '背包';
            } else if (product.producttype.toLowerCase().includes('sleeping')) {
                category = '野营';
                subcategory = '睡袋';
            } else if (product.producttype.toLowerCase().includes('boot')) {
                category = '鞋类';
                subcategory = '登山靴';
            }

            return {
                ...product,
                category: category || categoryNames[0] || '未分类',
                subcategory: subcategory || categoryNames[1] || null,
                categories: categoryNames
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
        console.error('Error fetching products:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ error: 'Failed to fetch products' })
        };
    }
};