// ./netlify/functions/get-tracking-number.js
const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase 客户端
// 确保您在 Netlify 中设置了这些环境变量
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY // 确认这里使用的是 SUPABASE_KEY
);

exports.handler = async function(event, context) {
    console.log('Function invoked.'); // 调试：函数被调用

    // 确保只处理 GET 请求
    if (event.httpMethod !== 'GET') {
        console.log('Method Not Allowed:', event.httpMethod); // 调试：方法不被允许
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    const orderId = event.queryStringParameters.orderId;
    console.log('Received orderId:', orderId); // 调试：收到的订单号

    if (!orderId) {
        console.log('Missing orderId parameter.'); // 调试：缺少订单号
        return {
            statusCode: 400, // Bad Request
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ success: false, message: 'Order number required' }),
        };
    }

    try {
        console.log(`Querying Supabase for orderId: ${orderId}`); // 调试：开始查询 Supabase

        // 从 Supabase 查询 orders 表
        // 假设您的订单号字段名为 'id' (UUID)，快递单号字段名为 'tracking_number'
        const { data, error } = await supabase
            .from('orders') // 您的表名
            .select('tracking_number') // 您要查询的字段
            .eq('id', orderId) // 根据 orderId 匹配
            .single(); // 期望只返回一条记录

        if (error) {
            // 如果是 PGRST116 错误（未找到行），我们不把它当作一个严重的错误，后续会处理 data 为 null 的情况
            if (error.code === 'PGRST116') {
                console.log(`Order with ID ${orderId} not found in Supabase (PGRST116).`); // 调试：未找到订单
            } else {
                console.error('Supabase 查询错误:', error); // 调试：其他 Supabase 查询错误
                return {
                    statusCode: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ success: false, message: 'Query failed. Please try again later.' }),
                };
            }
        }

        const trackingNumber = data ? data.tracking_number : null;
        console.log('Supabase query result (data):', data); // 调试：Supabase 查询结果的原始数据
        console.log('Extracted trackingNumber:', trackingNumber); // 调试：提取出的快递单号

        if (trackingNumber) {
            console.log(`Found tracking number: ${trackingNumber} for orderId: ${orderId}`); // 调试：找到快递单号
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ success: true, trackingNumber: trackingNumber }),
            };
        } else {
            // 未找到快递单号的情况，可能订单未发货或订单号不正确
            console.log(`Tracking number not found for orderId: ${orderId}.`); // 调试：未找到快递单号
            return {
                statusCode: 200, // 200 OK，但 success: false 表示业务逻辑未找到
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ success: false, message: 'No tracking number found for this order. The express delivery might not have been shipped yet. Please wait patiently or check if the order number is correct.' }),
            };
        }
    } catch (error) {
        console.error('处理请求时发生未知错误:', error); // 调试：捕获到未知错误
        return {
            statusCode: 500, // Internal Server Error
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ success: false, message: 'Internal server error, unable to retrieve tracking number.' }),
        };
    }
};