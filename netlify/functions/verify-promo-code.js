const { createClient } = require('@supabase/supabase-js');

// 创建 Supabase 客户端
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

exports.handler = async (event, context) => {
  try {
    const { promoCode } = JSON.parse(event.body);  // 获取前端发送的优惠码

    if (!promoCode) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No promo code provided' }),
      };
    }
    console.log("前端获取到的优惠码" + promoCode)

    // 查询 Supabase 数据库中的未使用优惠码，并根据优惠码进行校验
    const { data, error } = await supabase
      .from('activation_codes')  // 表格名
      .select('id, code, discount_percentage, created_at, expires_at, is_used')  // 查询字段
      .eq('code', promoCode)  // 根据优惠码匹配
      .eq('is_used', false)  // 只查询未使用的优惠码
      .single();  // 只返回一个结果

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to fetch discount codes', error }),
      };
    }

    // 如果没有匹配的优惠码
    if (!data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid or used promo code' }),
      };
    }

    // 检查优惠码是否过期
    const currentDate = new Date();
    const expiresAt = new Date(data.expires_at);

    if (currentDate > expiresAt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Promo code has expired' }),
      };
    }

    // 如果优惠码有效并未过期，返回折扣信息
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        discount: data.discount_percentage, // 返回折扣百分比
        message: 'Promo code applied successfully',
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: err }),
    };
  }
};
