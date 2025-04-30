const { createClient } = require('@supabase/supabase-js');

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { orderId, order } = JSON.parse(event.body);  // 获取 orderId 和更新的订单数据

    if (!orderId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'orderId is required' }),
      };
    }

    // 查询现有的订单
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single(); // 查找一条订单

    if (fetchError || !existingOrder) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Order not found' }),
      };
    }

    // 更新订单信息
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        customer_name: order.full_name || existingOrder.customer_name,
        phone_number: order.phone_number || existingOrder.phone_number,
        email: order.email || existingOrder.email,
        shipping_address: {
          street_address: order.address_line_1 || existingOrder.shipping_address.street_address,
          city: order.city || existingOrder.shipping_address.city,
          state: order.state || existingOrder.shipping_address.state,
          postal_code: order.postal_code || existingOrder.shipping_address.postal_code,
          country: order.country || existingOrder.shipping_address.country,
        },
        order_notes: order.order_notes || existingOrder.order_notes,  // 更新订单备注
        updated_at: new Date().toISOString(), // 更新当前时间
      })
      .eq('id', orderId)  // 更新指定的订单
      .single();

    if (updateError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to update order', message: updateError.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order successfully updated'}),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server Error', message: error.message }),
    };
  }
};
