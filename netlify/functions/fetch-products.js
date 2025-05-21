// const { createClient } = require('@supabase/supabase-js');

// exports.handler = async function (event, context) {
//   const supabase = createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_KEY
//   );

//   try {
//     // 查询所有字段，并关联分类名称
//     const { data: products, error } = await supabase
//       .from('products')
//       .select(`
//         *,
//         product_categories (
//           categories (
//             name
//           )
//         )
//       `);

//     if (error) throw error;

//     const processedProducts = products.map(product => {
//       const categoryList =
//         product.product_categories?.map(pc => pc.categories?.name).filter(Boolean) || [];

//       // 处理价格和折扣
//       const price = parseFloat(product.price) || 0;
//       const discountRate = parseFloat(product.discount);

//       let finalPrice = price;
//       let discountPercent = 0;

//       if (!isNaN(discountRate)) {
//         if (discountRate > 1) {
//           // 如果 discount 是百分数 (比如 20)，换成 0.8
//           finalPrice = price * (1 - discountRate / 100);
//           discountPercent = discountRate;
//         } else {
//           // 如果 discount 已经是比例 (比如 0.8)，直接乘
//           finalPrice = price * discountRate;
//           discountPercent = (1 - discountRate) * 100;
//         }
//       }
      
//       return {
//         ...product,
//         final_price: finalPrice.toFixed(2),   // ✅ 折扣后价格
//         discount_percent: Math.round(discountPercent), // ✅ 折扣百分比，四舍五入
//         categories: categoryList,
//         category: categoryList[0] || 'Uncategorized',
//         subcategory: categoryList[1] || null
//       };
//     });

//     return {
//       statusCode: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(processedProducts)
//     };
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: 'Failed to fetch products' })
//     };
//   }
// };




const { createClient } = require('@supabase/supabase-js');
const zlib = require('zlib');

exports.handler = async function (event, context) {
  // 初始化 Supabase 客户端
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  try {
    // 1. 查询产品并做处理（同你现有逻辑）
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        discount,
        image_url,
        product_categories (
          categories ( name )
        )
      `);
    if (error) throw error;

    const processedProducts = products.map(product => {
      const categoryList =
        product.product_categories?.map(pc => pc.categories?.name).filter(Boolean) || [];
      const price = parseFloat(product.price) || 0;
      const discountRate = parseFloat(product.discount);
      let finalPrice = price;
      let discountPercent = 0;

      if (!isNaN(discountRate)) {
        if (discountRate > 1) {
          finalPrice = price * (1 - discountRate / 100);
          discountPercent = discountRate;
        } else {
          finalPrice = price * discountRate;
          discountPercent = (1 - discountRate) * 100;
        }
      }

      return {
        id: product.id,
        name: product.name,
        final_price: finalPrice.toFixed(2),
        discount_percent: Math.round(discountPercent),
        image_url: product.image_url,
        categories: categoryList,
        category: categoryList[0] || 'Uncategorized',
        subcategory: categoryList[1] || null,
      };
    });

    // 2. 序列化并 Gzip 压缩
    const json = JSON.stringify(processedProducts);
    const gzipped = zlib.gzipSync(json);

    // 3. 返回 base64 编码的压缩结果，并设置合适的头
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
        // 缓存 60 秒到浏览器，本地边缘节点缓存 300 秒
        'Cache-Control': 'public, max-age=60, s-maxage=300'
      },
      body: gzipped.toString('base64')
    };

  } catch (err) {
    console.error('Error fetching products:', err);
    // 错误情况下不压缩也可以，但这里示范一致返回 JSON
    const errorBody = JSON.stringify({ error: err.message });
    const gzippedErr = zlib.gzipSync(errorBody);

    return {
      statusCode: err.statusCode || 500,
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
