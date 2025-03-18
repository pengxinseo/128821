import PricingPlan from '@/components/PricingPlan';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold text-center mb-2">Creem Payment Demo</h1>
        <div className="text-center mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
            Test Mode
          </span>
        </div>
        <p className="text-center text-gray-600 mb-4">
          This demo uses real Creem test API integration with webhooks
        </p>
        <p className="text-center text-gray-500 mb-6 text-sm">
          API Key: creem_test_2ZfiQdu1w6C29pbWZbmxki | Webhook URL: https://128821.vercel.app/api/webhooks
        </p>
        
        <div className="flex justify-center">
          <PricingPlan />
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            href="/payments" 
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            查看支付记录
          </Link>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Check the browser console to see payment status logs</p>
          <p className="mt-2">
            Upon successful payment, webhooks will be received at the webhook URL,
            and payment details will be displayed on the success page.
          </p>
        </div>
      </div>
    </main>
  );
}
