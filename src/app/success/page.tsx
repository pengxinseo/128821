'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = {
      checkout_id: searchParams.get('checkout_id'),
      order_id: searchParams.get('order_id'),
      customer_id: searchParams.get('customer_id'),
      subscription_id: searchParams.get('subscription_id'),
      product_id: searchParams.get('product_id'),
      request_id: searchParams.get('request_id'),
      signature: searchParams.get('signature'),
    };

    setPaymentDetails(params);
    setLoading(false);
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="bg-green-100 border border-green-300 rounded-lg p-8 max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-3">Payment Successful!</h1>
        <p className="text-lg mb-6">Thank you for your purchase. Your transaction has been completed.</p>

        {loading ? (
          <div className="text-center py-4">Loading payment details...</div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-3">Payment Details</h2>
            {Object.entries(paymentDetails)
              .filter(([_, value]) => value !== null)
              .map(([key, value]) => (
                <li key={key} className="mb-2 list-none">
                  <span className="font-medium">{key}:</span> {value}
                </li>
              ))}
          </div>
        )}

        <Link href="/" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Return to Home
        </Link>
      </div>
    </main>
  );
}