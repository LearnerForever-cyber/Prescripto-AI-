import Razorpay from 'razorpay';
import { Handler, HandlerEvent } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, currency = 'INR', receipt } = JSON.parse(event.body);

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required' }),
      };
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise for INR)
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    return {
      statusCode: 200,
      body: JSON.stringify(order),
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create order' }),
    };
  }
};
