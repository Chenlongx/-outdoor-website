const { createClient } = require('@supabase/supabase-js');

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
    const now = new Date().toISOString();

    // ✅ 解析前端传的 body
    const parsedBody = JSON.parse(event.body || '{}');
    const order = parsedBody.order || {};        // ✅ 前端的订单对象
    const items = parsedBody.items || [];        // ✅ 商品列表数组

    // ✅ 前端履约地址
    const shipping = order.shipping_address || {};
    // ✅ PayPal 返回地址（仅存储对比）
    const paypalAddr = order.paypal_address || {};
    // ✅ PayPal 付款人信息
    const payerInfo = order.payer_info || {};

    // ✅ 兜底 email（优先 shipping.email，次选 payer_info.email）
    const customerEmail =
      shipping.email ||
      payerInfo.email_address ||
      payerInfo.email ||
      null;

    // ✅ 兜底客户姓名（优先履约地址的 full_name）
    const customerName =
      shipping.full_name ||
      (payerInfo.name ? `${payerInfo.name.given_name || ''} ${payerInfo.name.surname || ''}`.trim() : null) ||
      null;

    // ✅ 兜底电话
    const customerPhone = shipping.phone_number || null;

    // ✅ 打印日志方便调试
    // console.log('==== Parsed Order ====');
    // console.log('order:', JSON.stringify(order, null, 2));
    // console.log('items:', JSON.stringify(items, null, 2));
    // console.log('customerName:', customerName);
    // console.log('customerEmail:', customerEmail);

    // ✅ 如果关键字段缺失，直接返回 400
    if (!customerName || !customerEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required customer name or email',
          debug: { customerName, customerEmail }
        }),
      };
    }

    // ✅ 插入数据库
    const { data: insertedOrder, error: insertError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: customerName,
          email: customerEmail,
          phone_number: customerPhone,

          // ✅ 存储 JSON 地址信息（方便后期核对）
          shipping_address: shipping,
          paypal_address: paypalAddr,
          payer_info: payerInfo,

          total_amount: order.total_amount || 0,
          products: items,   // 直接存 JSON 数组
          status: 'paid',
          created_at: now,
          updated_at: now
        }
      ])
      .select('id') // ✅ 直接返回插入后的订单 id
      .single();

    if (insertError) {
      console.error('❌ Error inserting order:', insertError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Database insert failed',
          error: insertError
        }),
      };
    }

    console.log('✅ Inserted Order ID:', insertedOrder.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Order successfully saved',
        orderId: insertedOrder.id
      }),
    };

  } catch (err) {
    console.error('❌ Server Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Server Error',
        error: err.message || err
      }),
    };
  }
};
