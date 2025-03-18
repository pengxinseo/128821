'use client';

import { useState } from 'react';
import Link from 'next/link';
import config from '@/config';

// 产品配置从config中获取
const products = [
  {
    id: config.creem.products.basic.id,
    name: '基础套餐',
    price: config.creem.products.basic.price,
    description: '基础功能，适合个人用户'
  },
  {
    id: config.creem.products.standard.id,
    name: '标准套餐',
    price: config.creem.products.standard.price,
    description: '标准功能，适合小型团队'
  }
];

export default function Home() {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  
  // 创建结账会话
  const createCheckout = async (productId: string) => {
    setLoading(prev => ({ ...prev, [productId]: true }));
    setError(null);
    
    try {
      const requestId = `req_${Date.now()}`;
      const userId = `user_${Date.now()}`;
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId,
          request_id: requestId,
          success_url: `${window.location.origin}/success`,
          metadata: {
            userId: userId,
            orderId: `order_${Date.now()}`,
            appSource: 'iuu_creem'
          }
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.checkout?.url) {
        // 如果成功，重定向到结账URL
        window.location.href = data.checkout.url;
      } else {
        setError(data.error || '创建结账会话失败');
      }
    } catch (err) {
      console.error('结账错误:', err);
      setError('请求出错: ' + String(err));
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Creem支付集成演示</h1>
      
      <p className="text-lg mb-12 text-center max-w-3xl">
        这是一个使用Creem支付系统的演示应用。您可以选择以下任意套餐进行测试支付。
        <br />
        <span className="text-blue-500 font-semibold">
          注意：{config.creem.testMode ? '这是测试环境，不会产生实际费用。' : '这是正式环境，将产生实际交易。'}
        </span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="border rounded-lg p-6 flex flex-col h-full shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <div className="text-3xl font-bold text-blue-600 mb-4">${product.price} <span className="text-sm font-normal text-gray-500">USD</span></div>
            <p className="mb-6 text-gray-600 flex-grow">{product.description}</p>
            <button 
              onClick={() => createCheckout(product.id)}
              disabled={loading[product.id]}
              className={`${
                loading[product.id] ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              } text-white py-3 px-6 rounded-lg font-medium text-center transition-colors`}
            >
              {loading[product.id] ? '处理中...' : '立即购买'}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 w-full max-w-3xl">
          <h3 className="font-bold mb-2">错误</h3>
          <p>{error}</p>
        </div>
      )}

      <div className="mt-16 p-6 bg-gray-50 rounded-lg max-w-3xl w-full">
        <h2 className="text-2xl font-bold mb-4">标准集成说明</h2>
        <p className="mb-4 text-gray-600">
          当点击"立即购买"时，我们会：
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-600">
          <li>通过服务器API调用Creem创建结账会话</li>
          <li>生成唯一的request_id用于跟踪交易</li>
          <li>传递元数据（如用户ID）</li>
          <li>设置成功页面跳转地址</li>
          <li>重定向用户到Creem结账页面</li>
          <li>支付成功后，用户将被重定向回我们的成功页面</li>
          <li>同时，Creem会发送webhook通知，我们将数据存入数据库</li>
        </ol>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg max-w-3xl w-full">
        <h2 className="text-2xl font-bold mb-4">测试说明</h2>
        <p className="mb-4">
          这是一个{config.creem.testMode ? <strong>测试集成</strong> : <strong>生产集成</strong>}，使用Creem支付系统。
          {config.creem.testMode && (
            <>测试环境中，您可以使用以下信息：</>
          )}
        </p>
        {config.creem.testMode && (
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>测试卡号: <code className="bg-gray-100 px-2 py-1 rounded">4242 4242 4242 4242</code></li>
            <li>有效期: 任意未来日期</li>
            <li>CVV: 任意3位数</li>
          </ul>
        )}
        <p>
          支付成功后，系统会将您重定向到成功页面，并记录交易信息。
        </p>
      </div>

      <div className="mt-8">
        <Link href="/payments" className="text-blue-500 hover:underline mr-4">
          查看支付记录
        </Link>
        <Link href="/api/webhooks" className="text-blue-500 hover:underline" target="_blank">
          查看Webhook端点
        </Link>
      </div>
    </main>
  );
}
