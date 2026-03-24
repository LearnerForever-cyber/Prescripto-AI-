import { createClerkSupabaseClient } from '../lib/supabase';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const waitForRazorpay = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) { resolve(); return; }
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if ((window as any).Razorpay) {
        clearInterval(interval);
        resolve();
      } else if (attempts > 20) {
        clearInterval(interval);
        reject(new Error('Razorpay SDK failed to load. Please disable any ad-blockers and try again.'));
      }
    }, 250);
  });
};

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
        await waitForRazorpay();

        // 1. Create order via Netlify function
        const orderResponse = await fetch('/.netlify/functions/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: pack.price,
            currency: 'INR',
            receipt: `receipt_${userId}_${Date.now()}`,
          }),
        });

        // Read body ONCE as text, then parse
        const orderText = await orderResponse.text();
        console.log('create-order response:', orderResponse.status, orderText);

        let order: any;
        try {
          order = JSON.parse(orderText);
        } catch {
          throw new Error(`Server returned invalid response: ${orderText}`);
        }

        if (!orderResponse.ok) {
          // Show the actual server error to the user
          throw new Error(order?.error || order?.razorpay_error?.description || `Order creation failed (${orderResponse.status})`);
        }

        // 2. Open Razorpay checkout
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'Prescription AI',
          description: `${pack.name} — ${pack.credits} Credits`,
          order_id: order.id,
          prefill: { name: userName, email: userEmail },
          theme: { color: '#00a3e0' },
          notes: { mode: 'beta_test', pack_id: pack.id, user_id: userId },
          handler: async (response: RazorpayResponse) => {
            try {
              const verifyResponse = await fetch('/.netlify/functions/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  userId,
                  creditsToAdd: pack.credits,
                }),
              });

              const verifyText = await verifyResponse.text();
              console.log('verify-payment response:', verifyResponse.status, verifyText);

              let verification: any;
              try { verification = JSON.parse(verifyText); } catch { throw new Error('Invalid verify response'); }

              if (!verifyResponse.ok) {
                throw new Error(verification?.error || 'Payment verification failed');
              }

              resolve(verification.success === true);
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => resolve(false),
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (r: any) => {
          reject(new Error(`Payment failed: ${r.error?.description || 'Unknown error'}`));
        });
        rzp.open();

      } catch (error) {
        reject(error);
      }
    };

    startPayment();
  });
};
