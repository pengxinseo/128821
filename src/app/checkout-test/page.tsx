'use client';

import { useState, useEffect } from 'react';
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
  },
  {
    id: config.creem.products.premium.id,
    name: '高级套餐', 
    price: config.creem.products.premium.price,
    description: '全功能套餐，适合企业级需求'
  }
];

export default function CheckoutTest() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0].id);
  const [userId, setUserId] = useState<string>('test_user_123');
  const [testMode, setTestMode] = useState<boolean>(true);
  const [logs, setLogs] = useState<string[]>([]);
  
  // 添加日志
  const addLog = (message: string) => {
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 19)
    ]);
  };
  
  // 创建结账会话
  const createCheckout = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    addLog(`创建结账会话 (产品: ${selectedProduct})`);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: selectedProduct,
          userId: userId,
          liveMode: !testMode,
          request_id: `req_${Date.now()}`,
          metadata: {
            source: 'checkout-test-page'
          }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        addLog(`创建失败: ${data.error || '未知错误'}`);
        setError(data.error || '创建结账会话失败');
      } else {
        addLog(`创建成功! 结账URL: ${data.checkout?.url || '未知'}`);
        setResult(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`发生错误: ${message}`);
      setError(`请求发生错误: ${message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    addLog('测试页面已加载');
    addLog(`当前模式: ${config.creem.testMode ? '测试模式' : '生产模式'}`);
  }, []);
  
  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creem 结账测试</h1>
        <p className="text-gray-600">
          此页面用于测试 Creem 结账流程，包括创建结账会话和接收 Webhook 通知。
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">创建结账会话</h2>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">选择产品:</label>
              <select 
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={loading}
              >
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (${product.price} USD) - {product.id}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">用户ID:</label>
              <input 
                type="text" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="mr-2"
                  disabled={loading}
                />
                <span>测试模式</span>
              </label>
            </div>
            
            <button 
              onClick={createCheckout}
              disabled={loading}
              className={`${
                loading 
                  ? 'bg-gray-400' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white py-2 px-4 rounded-md font-medium transition-colors w-full`}
            >
              {loading ? '处理中...' : '创建结账会话'}
            </button>
          </div>
          
          {error && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-6 text-red-700">
              <h3 className="font-bold mb-2">错误</h3>
              <p>{error}</p>
            </div>
          )}
          
          {result && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-green-700 mb-2">结账会话已创建</h3>
              
              <div className="mb-4">
                <p>
                  <span className="font-medium">订单ID:</span> {result.orderId}
                </p>
                {result.checkout?.id && (
                  <p>
                    <span className="font-medium">结账ID:</span> {result.checkout.id}
                  </p>
                )}
              </div>
              
              {result.checkout?.url && (
                <a 
                  href={result.checkout.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  前往支付
                </a>
              )}
            </div>
          )}
        </div>
        
        <div className="col-span-1">
          <div className="border rounded-lg p-4 h-full">
            <h2 className="text-xl font-bold mb-2">日志</h2>
            <div className="bg-gray-100 p-3 rounded-md h-[500px] overflow-y-auto font-mono text-sm">
              {logs.length > 0 ? (
                <div>
                  {logs.map((log, i) => (
                    <div key={i} className="mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">暂无日志</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex space-x-4">
        <Link href="/" className="text-blue-500 hover:underline">
          返回首页
        </Link>
        <Link href="/api/webhooks" target="_blank" className="text-blue-500 hover:underline">
          查看Webhook测试页面
        </Link>
        <Link href="/payments" className="text-blue-500 hover:underline">
          查看支付记录
        </Link>
      </div>
    </main>
  );
} 