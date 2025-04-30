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
    // 打印请求体以确保数据正确
    // console.log('Received request body:', event.body);

    // 获取请求体中的数据（订单和购物车信息）
    const { order, items, phone_number, order_notes } = JSON.parse(event.body);  // 解析请求体中的数据

    // 打印订单和商品数据
    console.log('Parsed order:', order);
    console.log('Parsed items:', items);
    console.log("Total amount before inserting:", order.total_amount);
    const currentTime = new Date().toISOString();
    // 插入订单信息到 orders 表
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: order.full_name,
          email: order.email,
          shipping_address: {
            street_address: order.address_line_1,
            city: order.city,
            state: order.state,
            postal_code: order.postal_code,
            country: order.country,
          },
          total_amount: order.total_amount,
          products: items,  // 将所有订单项作为 JSON 数组存储
          status: 'paid',  // 假设支付成功，订单状态为 "paid"
          created_at: currentTime, // 设置创建时间
          updated_at: currentTime, // 设置更新时间
          phone_number: phone_number || null, // 如果电话号码有值，则存储，否则为 null
          order_notes: order_notes || null,   // 如果订单备注有值，则存储，否则为 null
        }
      ])
    //   .single();

    // 如果插入数据时发生错误
    if (orderError) {
      console.error('Error inserting order:', orderError);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error inserting order', error: orderError }),
      };
    }

    // 直接查询插入的订单
    const { data: insertedOrder, error: selectError } = await supabase
    .from('orders')
    .select('id')  // 只选择id字段
    .eq('email', order.email)  // 使用 email 或其他唯一字段来确保查询插入的记录
    .order('created_at', { ascending: false })  // 根据创建时间降序，确保获取最近插入的订单
    .limit(1)  // 只取一条数据

    // 打印并返回插入的订单ID
    console.log('Inserted Order ID:', insertedOrder[0].id);

    // 返回成功消息
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order successfully submitted', orderId: insertedOrder[0].id }),
    };
  } catch (error) {
    // 捕获并打印其他错误
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server Error', error }),
    };
  }
};
