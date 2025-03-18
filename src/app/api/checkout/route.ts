import { NextResponse } from 'next/server';

// 使用带测试模式的真实 Creem API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 确保有用户ID
    const userId = body.userId || '3';
    
    // 从请求中提取元数据
    const metadata = body.metadata || {};
    
    // 确保元数据中包含用户ID
    if (!metadata.userId) {
      metadata.userId = userId;
    }
    
    // 使用真实的 Creem API 并带测试 API 密钥
    const response = await fetch('https://test-api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'creem_test_2ZfiQdu1w6C29pbWZbmxki'
      },
      body: JSON.stringify({
        product_id: body.product_id || 'prod_5o4cv1dxKuW50AclR6TJI0',
        request_id: body.request_id,
        success_url: body.success_url,
        metadata: {
          ...metadata,
          userId: userId,
          orderId: body.orderId || `order_${Date.now()}`,
          appSource: 'next-creem-demo'
        }
      })
    });
    
    const responseData = await response.json();
    console.log('结账会话已创建:', responseData);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('结账错误:', error);
    return NextResponse.json(
      { error: '创建结账会话失败', details: String(error) },
      { status: 500 }
    );
  }
} 