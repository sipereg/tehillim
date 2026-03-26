const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cokudqsvhumaucvmjqmx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { uid, ref } = JSON.parse(event.body);
    const db = createClient(SUPABASE_URL, SUPABASE_KEY);
    const insertData = { uid };
    if (ref) insertData.ref = ref;
    const { error } = await db.from('reads').insert(insertData);
    if (error) throw new Error(error.message);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
