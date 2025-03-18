'use client';

import { useState } from 'react';

// 使用 Creem 提供的特定产品ID
const PRODUCT_ID = 'prod_5o4cv1dxKuW50AclR6TJI0';
// 固定用户ID为3
const USER_ID = '3';

export default function PricingPlan() {
  const [loading, setLoading] = useState(false);
  const [directCheckout, setDirectCheckout] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      if (directCheckout) {
        // 直接跳转到 Creem 托管的结账页面
        window.location.href = 'https://www.creem.io/test/payment/prod_5o4cv1dxKuW50AclR6TJI0';
        return;
      }
      
      // 生成唯一请求 ID 用于跟踪支付
      const requestId = `req_${Math.random().toString(36).substring(2, 15)}`;
      
      // 创建结账会话
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: PRODUCT_ID,
          request_id: requestId,
          success_url: `${window.location.origin}/success`,
          userId: USER_ID,
          orderId: 'order_' + Date.now(),
          // 添加更多元数据用于跟踪
          metadata: {
            userId: USER_ID,
            source: 'web_app',
            timestamp: Date.now()
          }
        }),
      });

      const data = await response.json();
      
      if (data.checkout_url) {
        console.log('重定向到结账页面:', data.checkout_url);
        // 跳转到结账URL
        window.location.href = data.checkout_url;
      } else {
        throw new Error('未返回结账URL');
      }
    } catch (error) {
      console.error('创建结账会话时出错:', error);
      alert('无法开始支付。请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  // 切换结账方法
  const toggleCheckoutMethod = () => {
    setDirectCheckout(!directCheckout);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full">
      <div className="bg-blue-600 p-6 text-white text-center">
        <h3 className="text-2xl font-bold">基础套餐</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold">$6.9</span>
          <span className="text-xl ml-1">/月</span>
        </div>
      </div>
      
      <div className="p-6">
        <ul className="space-y-3">
          <li className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            完整功能访问权限
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            优先支持
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            每月更新
          </li>
        </ul>
        
        <button 
          onClick={handleCheckout}
          disabled={loading}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-70"
        >
          {loading ? '处理中...' : '现在订阅'}
        </button>
        
        <div className="mt-3 flex items-center justify-center text-sm">
          <label className="flex items-center text-gray-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={directCheckout} 
              onChange={toggleCheckoutMethod}
              className="mr-2" 
            />
            使用直接 Creem 结账 URL
          </label>
        </div>
        
        <p className="text-xs text-gray-500 mt-4 text-center">
          由 Creem 提供安全支付 (用户ID: {USER_ID})
        </p>
      </div>
    </div>
  );
} 