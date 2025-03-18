'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Payment {
  id: number;
  user_id: string;
  plan_id: number;
  amount: number;
  payment_method: string;
  transaction_id: string;
  status: number;
  payment_date: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const response = await fetch('/api/payments');
        const data = await response.json();
        
        if (data.success) {
          setPayments(data.data);
        } else {
          setError(data.error || '获取支付记录失败');
        }
      } catch (err) {
        setError('获取支付记录时发生错误');
        console.error('获取支付记录时出错:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, []);

  // 格式化状态为文本
  const formatStatus = (status: number) => {
    switch (status) {
      case 0: return '处理中';
      case 1: return '成功';
      case 2: return '失败';
      default: return '未知';
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">支付记录</h1>
          <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            返回首页
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4">加载支付记录中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-md">
            <p className="text-gray-500">暂无支付记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户ID</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">计划ID</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支付方式</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">交易ID</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支付时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 whitespace-nowrap">{payment.id}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{payment.user_id}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{payment.plan_id}</td>
                    <td className="py-3 px-4 whitespace-nowrap">${payment.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{payment.payment_method}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="truncate block max-w-[150px]" title={payment.transaction_id}>
                        {payment.transaction_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        payment.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 2 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {formatStatus(payment.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatDate(payment.payment_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
} 