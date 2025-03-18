'use client';

import { useState } from 'react';

// Using the specific product ID from Creem
const PRODUCT_ID = 'prod_5o4cv1dxKuW50AclR6TJI0';

export default function PricingPlan() {
  const [loading, setLoading] = useState(false);
  const [directCheckout, setDirectCheckout] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      if (directCheckout) {
        // Redirect directly to Creem hosted checkout page
        window.location.href = 'https://www.creem.io/test/payment/prod_5o4cv1dxKuW50AclR6TJI0';
        return;
      }
      
      // Generate a unique request ID for tracking this payment
      const requestId = `req_${Math.random().toString(36).substring(2, 15)}`;
      
      // Create checkout session using our API that connects to Creem
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: PRODUCT_ID,
          request_id: requestId,
          success_url: `${window.location.origin}/success`,
          userId: 'user_' + Math.floor(Math.random() * 1000),
          orderId: 'order_' + Date.now()
        }),
      });

      const data = await response.json();
      
      if (data.checkout_url) {
        console.log('Redirecting to checkout:', data.checkout_url);
        // Redirect to the checkout URL
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle between API checkout and direct URL checkout
  const toggleCheckoutMethod = () => {
    setDirectCheckout(!directCheckout);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full">
      <div className="bg-blue-600 p-6 text-white text-center">
        <h3 className="text-2xl font-bold">Basic Plan</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold">$6.9</span>
          <span className="text-xl ml-1">/month</span>
        </div>
      </div>
      
      <div className="p-6">
        <ul className="space-y-3">
          <li className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Full Access to All Features
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Priority Support
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Monthly Updates
          </li>
        </ul>
        
        <button 
          onClick={handleCheckout}
          disabled={loading}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-70"
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>
        
        <div className="mt-3 flex items-center justify-center text-sm">
          <label className="flex items-center text-gray-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={directCheckout} 
              onChange={toggleCheckoutMethod}
              className="mr-2" 
            />
            Use direct Creem checkout URL
          </label>
        </div>
        
        <p className="text-xs text-gray-500 mt-4 text-center">
          Secure checkout powered by Creem
        </p>
      </div>
    </div>
  );
} 