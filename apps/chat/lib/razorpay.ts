/**
 * Razorpay Client Utility
 *
 * Lazily loads the Razorpay checkout script and exposes a typed
 * `openRazorpayCheckout` helper.
 *
 * Usage:
 *  const options = { key, amount, currency, ... };
 *  await openRazorpayCheckout(options);
 */

// Razorpay SDK type stubs (no @types/razorpay package needed)
interface RazorpayOptions {
  key: string;
  amount: number; // in smallest unit (paise for INR)
  currency: string;
  name?: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open(): void;
      close(): void;
    };
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptLoaded = false;

/** Lazily inject the Razorpay checkout.js script */
function loadRazorpayScript(): Promise<void> {
  if (scriptLoaded || (typeof window !== 'undefined' && window.Razorpay)) {
    scriptLoaded = true;
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () =>
      reject(new Error('Failed to load Razorpay checkout script'));
    document.head.appendChild(script);
  });
}

/**
 * Open the Razorpay checkout modal.
 *
 * @param options - Razorpay options including key, order_id, amount, currency
 * @returns Promise that resolves with the payment response or rejects on dismiss/error
 */
export async function openRazorpayCheckout(
  options: Omit<RazorpayOptions, 'handler' | 'modal'>
): Promise<RazorpayPaymentResponse> {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      ...options,
      handler: resolve,
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled by user')),
      },
    });
    rzp.open();
  });
}
