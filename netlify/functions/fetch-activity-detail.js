const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async function (event, context) {
  const activityId = event.queryStringParameters.id;

  if (!activityId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing activity ID' }),
    };
  }

  try {
    const { data, error } = await supabase
      .from('activitiespage')
      .select(`
        id,
        name,
        description,
        duration,
        start_time,
        end_time,
        created_at,
        updated_at,
        is_active,
        content_images
      `)
      .eq('id', activityId)
      .single(); // 获取单条记录

    if (error) {
      console.error('Supabase 错误 (activity):', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('意外错误:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
