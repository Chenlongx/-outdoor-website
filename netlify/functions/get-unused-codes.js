const { createClient } = require('@supabase/supabase-js');

// 创建 Supabase 客户端
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  exports.handler = async (event, context) => {
    try {
      // 查询 Supabase 数据库中的未使用优惠码
      const { data, error } = await supabase
        .from('activation_codes')  // 表格名
        .select('id, code, discount_percentage, created_at, expires_at')  // 查询字段
        .eq('is_used', false)  // 只查询未使用的优惠码
        .limit(1);  // 只返回一个未使用的优惠码

      if (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Failed to fetch unused discount codes', error }),
        };
      }
  
      // 如果没有未使用的优惠码
      if (data.length === 0) {
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'No unused discount codes available' }),
        };
      }
  
      // 成功返回数据
      return {
        statusCode: 200,
        body: JSON.stringify({ codes: data[0] }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error', error: err }),
      };
    }
  };
