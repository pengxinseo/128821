import { NextResponse } from 'next/server';
import config from '@/config';

// 使用配置系统中的 Creem API 信息
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 记录请求内容，便于调试
    console.log('收到结账请求:', body);
    
    // 确保有用户ID
    const userId = body.userId || '3';
    
    // 从请求中提取元数据
    const metadata = body.metadata || {};
    
    // 确保元数据中包含用户ID
    if (!metadata.userId) {
      metadata.userId = userId;
    }
    
    // 生成唯一订单ID
    const orderId = body.orderId || `order_${Date.now()}`;
    
    // 使用配置中的API密钥
    const apiKey = config.creem.testMode 
      ? config.creem.apiKey  // 测试模式API密钥
      : body.liveMode 
        ? config.creem.secretKey  // 生产模式API密钥
        : config.creem.apiKey;  // 默认使用测试模式API密钥
    
    // 根据模式选择API端点
    const apiEndpoint = config.creem.testMode || !body.liveMode
      ? 'https://test-api.creem.io/v1/checkouts'
      : 'https://api.creem.io/v1/checkouts';
    
    console.log(`创建结账会话: ${config.creem.testMode ? '测试模式' : '生产模式'}`);
    console.log(`API端点: ${apiEndpoint}`);
    console.log(`产品ID: ${body.product_id}`);
    console.log(`订单ID: ${orderId}`);
    
    // 构建请求数据
    const requestData = {
      product_id: body.product_id,
      request_id: body.request_id || `req_${Date.now()}`,
      success_url: body.success_url || `${config.app.baseUrl}/success`,
      metadata: {
        ...metadata,
        userId: userId,
        orderId: orderId,
        appSource: 'iuu_creem'
      }
    };
    
    console.log('发送到Creem的请求数据:', requestData);
    
    // 调用Creem API创建结账会话
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(requestData)
    });
    
    // 获取并验证响应
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Creem API错误:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return NextResponse.json({
        error: `Creem API返回错误: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }
    
    const responseData = await response.json();
    console.log('结账会话已创建:', responseData);
    
    return NextResponse.json({
      success: true,
      checkout: responseData,
      orderId: orderId
    });
  } catch (error) {
    console.error('结账错误:', error);
    return NextResponse.json(
      { success: false, error: '创建结账会话失败', details: String(error) },
      { status: 500 }
    );
  }
} 