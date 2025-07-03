const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  try {
    const { promoCode } = JSON.parse(event.body);

    if (!promoCode) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error_code: 1001,
          message: 'No promo code provided',
        }),
      };
    }

    const { data, error } = await supabase
      .from('activation_codes')
      .select('id, code, discount_percentage, created_at, expires_at, is_used')
      .eq('code', promoCode)
      .single();

    if (error || !data) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error_code: 1003,
          message: 'Promo code does not exist',
        }),
      };
    }

    if (data.is_used) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error_code: 1004,
          message: 'Promo code has already been used',
        }),
      };
    }

    const currentDate = new Date();
    const expiresAt = new Date(data.expires_at);

    if (currentDate > expiresAt) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error_code: 1005,
          message: 'Promo code has expired',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
          success: true,
          discount_percentage: data.discount_percentage, // ✅ 明确返回的是百分比
          message: 'Promo code is valid',
      }),
  };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: err }),
    };
  }
};