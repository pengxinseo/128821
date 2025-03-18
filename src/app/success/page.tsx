'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Extract all query parameters
    const params = {
      checkout_id: searchParams.get('checkout_id'),
      order_id: searchParams.get('order_id'),
      customer_id: searchParams.get('customer_id'),
      subscription_id: searchParams.get('subscription_id'),
      product_id: searchParams.get('product_id'),
      request_id: searchParams.get('request_id'),
      signature: searchParams.get('signature')
    };
    
    setPaymentDetails(params);
    setLoading(false);
    
    // Log the payment success for tracking
    console.log('Payment Successful!', params);
    
    // In a real app, you might want to verify this payment with your backend
    // or update the UI based on the payment status from your database
  }, [searchParams]);
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="bg-green-100 border border-green-300 rounded-lg p-8 max-w-2xl w-full text-center">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
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
        
        <div className="space-y-3 mb-6">
          <p className="text-gray-700">
            We've received your payment and your subscription is now active! You should receive a confirmation email shortly.
          </p>
          <p className="text-gray-700">
            Thank you for choosing our service!
          </p>
        </div>
        
        <Link href="/" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Return to Home
        </Link>
      </div>
    </main>
  );
} 