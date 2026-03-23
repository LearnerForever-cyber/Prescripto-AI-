import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Handler, HandlerEvent } from '@netlify/functions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    console.error('RAZORPAY_KEY_SECRET missing');
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Payment service not configured.' }),
    };
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      creditsToAdd,
    } = JSON.parse(event.body || '{}');

    // 1. Verify Razorpay signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.error('Signature mismatch');
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Invalid payment signature' }),
      };
    }

    // 2. Update credits in Supabase
    if (supabaseUrl && serviceRoleKey && userId && creditsToAdd) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      // Get current credits
      const { data: currentData, error: fetchError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Supabase fetch error:', fetchError);
        throw new Error(fetchError.message);
      }

      const newCredits = (currentData?.credits || 0) + creditsToAdd;

      const { error: updateError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: userId,
          credits: newCredits,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error('Supabase upsert error:', updateError);
        throw new Error(updateError.message);
      }

      // Log payment record
      await supabase.from('payments').insert({
        user_id: userId,
        razorpay_order_id,
        razorpay_payment_id,
        credits_added: creditsToAdd,
        status: 'success',
      });
    } else {
      console.warn('Skipping Supabase update — missing env vars or params:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceRoleKey,
        userId,
        creditsToAdd,
      });
    }

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Payment verification failed. Please contact support.' }),
    };
  }
};
