import { createClerkSupabaseClient } from '../lib/supabase';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const processPayment = async (
  userId: string,
  pack: { id: string; price: number; credits: number; name: string },
  userEmail: string,
  userName: string,
  token: string | null
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const startPayment = async () => {
      try {
        // 1. Create order on the server
        const orderResponse = await fetch('/api/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: pack.price,
            currency: 'INR',
            receipt: `receipt_${userId}_${Date.now()}`,
          }),
        });

        if (!orderResponse.ok) {
          throw new Error('Failed to create order');
        }

        const order = await orderResponse.json();

        // 2. Initialize Razorpay Checkout
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "Prescription AI",
          description: `Purchase ${pack.credits} Credits - ${pack.name}`,
          image: "https://picsum.photos/seed/prescription-ai/200/200",
          order_id: order.id,
          handler: async (response: RazorpayResponse) => {
            try {
              // 3. Verify payment on the server
              const verifyResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(response),
              });

              const verification = await verifyResponse.json();

              if (verification.status === 'success') {
                // 4. Update credits in Supabase
                const supabase = createClerkSupabaseClient(token);
                
                // Get current credits
                const { data: currentData } = await supabase
                  .from('user_credits')
                  .select('credits')
                  .eq('user_id', userId)
                  .single();
                
                const newCredits = (currentData?.credits || 0) + pack.credits;

                // Update credits
                const { error: updateError } = await supabase
                  .from('user_credits')
                  .update({ credits: newCredits })
                  .eq('user_id', userId);

                if (updateError) throw updateError;

                // Record payment
                await supabase.from('payments').insert({
                  user_id: userId,
                  amount: pack.price,
                  credits: pack.credits,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  status: 'completed'
                });

                resolve(true);
              } else {
                resolve(false);
              }
            } catch (err) {
              console.error('Payment verification error:', err);
              reject(err);
            }
          },
          prefill: {
            name: userName,
            email: userEmail,
          },
          theme: {
            color: "#00a3e0",
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: { error: { description: string } }) {
          console.error('Payment failed:', response.error.description);
          resolve(false);
        });
        rzp.open();
      } catch (error) {
        console.error('Payment processing error:', error);
        reject(error);
      }
    };
    startPayment();
  });
};
