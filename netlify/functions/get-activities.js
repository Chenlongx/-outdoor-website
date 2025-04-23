const { createClient } = require('@supabase/supabase-js');

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event, context) => {
  try {
    // 查询 Supabase 数据库中的活动表格，选择结束时间字段
    const { data, error } = await supabase
      .from('activities')  // 表格名
      .select('end_time')  // 只查询结束时间字段

    if (error) {
      // 如果查询失败，返回错误
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to fetch activities', error }),
      };
    }

    // 假设返回的是一个活动记录（您可以根据需求做进一步的处理）
    const endTime = data.length > 0 ? data[0].end_time : null;

    if (!endTime) {
      // 如果没有返回结束时间，返回错误
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No end time found for the activity' }),
      };
    }

    // 成功返回数据
    return {
      statusCode: 200,
      body: JSON.stringify({ endTime: endTime }),
    };
  } catch (err) {
    // 捕获任何错误并返回
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: err }),
    };
  }
};