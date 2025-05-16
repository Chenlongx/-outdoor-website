const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async function (event, context) {
  try {
    // 第一个查询：获取 guide-article_categories 及其关联数据
    const { data: activityCategoryData, error: activityCategoryError } = await supabase
      .from('guide-article_categories')
      .select(`
        articles_id,
        categories_id,
        guide-article ( title, name, content, label, published_at, created_at, is_featured, featured_type, duration_minutes ),
        guide_categories ( name )
      `);

    if (activityCategoryError) {
      console.error('Supabase 错误 (activityCategory):', activityCategoryError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: activityCategoryError.message }),
      };
    }

    // 第二个查询：获取 guide_categories 表中所有 name 列的值
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('guide_categories')
      .select('name');

    if (categoriesError) {
      console.error('Supabase 错误 (categories):', categoriesError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: categoriesError.message }),
      };
    }

    // 合并两部分数据
    const response = {
      activityCategories: activityCategoryData,
      categoryNames: categoriesData.map(item => item.name) // 提取 name 列的值为数组
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.error('意外错误:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};