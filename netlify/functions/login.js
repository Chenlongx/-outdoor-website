const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const { email, password } = JSON.parse(event.body);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Auth error:', error.message);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authentication failed: ' + error.message }),
      };
    }

    console.log('Logged in, JWT:', data.session.access_token);
    return {
      statusCode: 200,
      body: JSON.stringify({ token: data.session.access_token }),
    };
  } catch (error) {
    console.log('Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};