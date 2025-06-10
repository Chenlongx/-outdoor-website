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
    const { orderId, order } = JSON.parse(event.body); // 获取 orderId 和更新的订单数据

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

    // 构建更新对象，只包含需要更新的字段，并处理嵌套的 shipping_address
    const updateData = {
      customer_name: order.full_name || existingOrder.customer_name,
      phone_number: order.phone_number || existingOrder.phone_number,
      email: order.email || existingOrder.email,
      order_notes: order.order_notes || existingOrder.order_notes,
      updated_at: new Date().toISOString(), // 更新当前时间
    };

    // 确保 existingOrder.shipping_address 存在且是对象，否则初始化一个空对象
    // 这可以避免在 existingOrder.shipping_address 为 null 或 undefined 时访问其属性导致错误
    const currentShippingAddress = existingOrder.shipping_address || {};

    updateData.shipping_address = {
        street_address: order.address_line_1 || currentShippingAddress.street_address,
        city: order.city || currentShippingAddress.city,
        state: order.state || currentShippingAddress.state,
        postal_code: order.postal_code || currentShippingAddress.postal_code,
        country: order.country || currentShippingAddress.country,
    };

    // 执行更新
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId) // 更新指定的订单
      .single();

    if (updateError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to update order', message: updateError.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order successfully updated', orderId: orderId }), // **✅ 在成功响应中返回 orderId**
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server Error', message: error.message }),
    };
  }
};