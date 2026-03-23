import { createClerkSupabaseClient } from '../lib/supabase';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Wait for Razorpay SDK to load from the script tag in index.html
const waitForRazorpay = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) {
      resolve();
      return;
    }
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
        // Wait for Razorpay SDK
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

        if (!orderResponse.ok) {
          const errText = await orderResponse.text();
          console.error('Create order error:', errText);
          throw new Error('Failed to create payment order. Please try again.');
        }

        const order = await orderResponse.json();

        // 2. Open Razorpay checkout
        const options = {
          // Use test key in beta — swap to live key for production
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,           // already in paise from server
          currency: order.currency,
          name: 'Prescription AI',
          description: `${pack.name} — ${pack.credits} Credits`,
          image: '/manifest.json',        // fallback; replace with your logo URL
          order_id: order.id,
          prefill: {
            name: userName,
            email: userEmail,
          },
          theme: {
            color: '#00a3e0',
          },
          // Beta: show test mode banner
          notes: {
            mode: 'beta_test',
            pack_id: pack.id,
            user_id: userId,
          },
          handler: async (response: RazorpayResponse) => {
            try {
              // 3. Verify payment via Netlify function
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

              if (!verifyResponse.ok) {
                const errText = await verifyResponse.text();
                console.error('Verify payment error:', errText);
                throw new Error('Payment verification failed. Please contact support.');
              }

              const verification = await verifyResponse.json();

              if (verification.success) {
                resolve(true);
              } else {
                resolve(false);
              }
            } catch (err) {
              console.error('Payment verification error:', err);
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              // User closed the modal without paying
              resolve(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);

        rzp.on('payment.failed', (response: { error: { description: string; reason: string } }) => {
          console.error('Payment failed:', response.error);
          reject(new Error(`Payment failed: ${response.error.description}`));
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
