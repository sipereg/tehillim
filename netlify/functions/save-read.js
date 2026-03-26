const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cokudqsvhumaucvmjqmx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { uid, ref, token } = JSON.parse(event.body);

    if (!uid) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing uid' }) };
    }

    // בדיקת reCAPTCHA — חוסם רק score מתחת ל-0.1
    if (token && RECAPTCHA_SECRET) {
      try {
        const captchaRes = await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${token}`,
          { method: 'POST' }
        );
        const captchaData = await captchaRes.json();
        console.log('reCAPTCHA score:', captchaData.score, 'success:', captchaData.success);
        if (captchaData.success && captchaData.score < 0.1) {
          return { statusCode: 403, body: JSON.stringify({ error: 'Bot detected' }) };
        }
      } catch(captchaErr) {
        console.log('reCAPTCHA error, allowing through:', captchaErr.message);
      }
    }

    const db = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const { error } = await db.rpc('safe_insert_read', {
      p_uid: uid,
      p_ref: ref || 'direct'
    });
    
    if (error) throw new Error(error.message);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
