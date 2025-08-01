const { createClient } = require('@supabase/supabase-js');

// 创建 Supabase 客户端
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    try {
        const { cart, promoCode, selectedShipping } = JSON.parse(event.body); // 解构出 selectedShipping

        let discountPercentage = 0;
        let promoCodeApplied = false; // 标记优惠码是否成功应用

        // 如果提供了 promoCode，则验证它
        if (promoCode) {
            const { data: promoData, error } = await supabase
                .from('activation_codes')
                .select('*')
                .eq('code', promoCode)
                .single();

            if (error) {
                console.warn('优惠码查询失败:', error.message);
            } else if (promoData && !promoData.used && new Date(promoData.expires_at) > new Date()) {
                discountPercentage = promoData.discount_percentage || 0;
                promoCodeApplied = true;
                console.log(`优惠码 ${promoCode} 有效，折扣为: ${discountPercentage}%`);
            } else {
                console.warn('优惠码无效、已使用或已过期');
            }
        }

        // 计算小计和折扣后的商品列表
        let subtotal = 0;
        const processedItems = cart.map(item => {
            let itemPrice = parseFloat(item.price);
            let discountedItemPrice = itemPrice;

            // 如果优惠码有效且有折扣，则计算每个商品的折扣价格
            if (promoCodeApplied && discountPercentage > 0) {
                discountedItemPrice = itemPrice * (1 - discountPercentage / 100);
            }
            
            // 确保价格格式正确，保留两位小数
            discountedItemPrice = parseFloat(discountedItemPrice.toFixed(2)); 

            // 累加计算小计（使用折扣后的价格）
            subtotal += discountedItemPrice * item.quantity;

            return {
                ...item, // 保留原始商品属性
                unit_amount: discountedItemPrice, // 存储每个商品的折扣价格
            };
        });

        subtotal = parseFloat(subtotal.toFixed(2)); // 最终的小计（应用所有商品级折扣后）

        // 确定运费
        // let shipping = typeof selectedShipping === 'number' ? selectedShipping : 9.9; // 如果提供了 selectedShipping 就用它，否则使用默认值

        // 确定运费
        let shipping;
        if (subtotal > 49.9) {
            shipping = 0; // 订单大于49.9，免运费
        } else {
            shipping = typeof selectedShipping === 'number' ? selectedShipping : 4.9; // 否则使用提供的运费或默认运费
        }

        const total = parseFloat((subtotal + shipping).toFixed(2));

        console.log("返回前端的总价格:", total); 

        return {
            statusCode: 200,
            body: JSON.stringify({
                subtotal,
                shipping,
                total,
                discount: discountPercentage, // 返回应用的折扣百分比
                items: processedItems, // 返回包含折扣价格的商品列表
            }),
        };

    } catch (error) {
        console.error('后端错误:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server Error' }),
        };
    }
};