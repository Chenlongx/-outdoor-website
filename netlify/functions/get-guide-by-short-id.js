// const { createClient } = require('@supabase/supabase-js');

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );

// exports.handler = async function (event, context) {
//   try {
//     const params = event.queryStringParameters || {};
//     const shortId = params.short_id;

//     if (!shortId || shortId.length < 4) {
//       return {
//         statusCode: 400,
//         body: JSON.stringify({ error: 'Missing or invalid short_id parameter.' }),
//       };
//     }

//     // 查询匹配前缀的 guide-article
//     const { data: articleData, error: articleError } = await supabase
//       .from('guide-article')
//       .select('*')
//       .ilike('id_text', `${shortId}%`) // 用 ilike 兼容大小写
//       .limit(1)
//       .single(); // 只取第一个匹配项

//     if (articleError) {
//       console.error('Supabase 错误 (guide-article):', articleError);
//       return {
//         statusCode: 500,
//         body: JSON.stringify({ error: articleError.message }),
//       };
//     }

//     if (!articleData) {
//       return {
//         statusCode: 404,
//         body: JSON.stringify({ error: 'Article not found for given short_id.' }),
//       };
//     }

//     return {
//       statusCode: 200,
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(articleData),
//     };

//   } catch (err) {
//     console.error('意外错误:', err);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: err.message }),
//     };
//   }
// };



const { createClient } = require('@supabase/supabase-js');
const zlib = require('zlib');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async function (event, context) {
  try {
    const params = event.queryStringParameters || {};
    const shortId = params.short_id;
    if (!shortId || shortId.length < 4) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid short_id.' }) };
    }

    const { data: articleData, error: articleError } = await supabase
      .from('guide-article')
      .select('*')
      .ilike('id_text', `${shortId}%`)
      .limit(1)
      .single();

    if (articleError) {
      console.error(articleError);
      return { statusCode: 500, body: JSON.stringify({ error: articleError.message }) };
    }
    if (!articleData) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Not found.' }) };
    }

    // —— 手动 gzip 压缩 JSON ——  
    const json = JSON.stringify(articleData);
    const compressed = zlib.gzipSync(json);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip'
      },
      isBase64Encoded: true,
      body: compressed.toString('base64')
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
