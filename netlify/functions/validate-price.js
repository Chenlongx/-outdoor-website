const { createClient } = require('@supabase/supabase-js');

// 创建 Supabase 客户端
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      };
    }
  
    try {
      // 获取请求体中的数据（购物车）
      const { cart } = JSON.parse(event.body);

      // 计算小计
      const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        
      console.log(subtotal)
      // 这里假设运费为固定费用，或者根据某些规则进行计算
      let shipping = 10.00; // 假设运费为 5.00 USD
      if (subtotal < 49) {
        shipping = 10.00; // 如果小计少于 49 美元，运费为 10.00 USD
      }
      // 计算总价格
      const total = (subtotal + shipping).toFixed(2);
      console.log("商品总价格:",total)
      // 从 Supabase 获取商品信息（如果需要）
      // 例如你可以从 Supabase 获取商品价格或其他数据
      // const { data, error } = await supabase.from('products').select('*');
      // if (error) {
      //     throw new Error('Error fetching data from Supabase');
      // }
      // 获取当前时间用于 `created_at` 和 `updated_at`
      const currentTime = new Date().toISOString();
  
      // 返回计算后的价格
      return {
        statusCode: 200,
        body: JSON.stringify({
          subtotal,
          shipping,
          total,
        }),
      };
    } catch (error) {
      console.error('Error:', error);
  
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Server Error' }),
      };
    }
  };