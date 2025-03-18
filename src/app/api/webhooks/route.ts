import { NextResponse, NextRequest } from 'next/server';
import * as crypto from 'crypto';
import { insertPayment, testConnection } from '@/lib/db';
import config from '@/config';

// 添加 GET 方法支持用于测试端点
export async function GET(request: Request) {
  console.log('GET 请求收到: 测试 webhook 端点');
  
  // 测试数据库连接
  try {
    const connected = await testConnection();
    if (connected) {
      return NextResponse.json({
        status: 'ok',
        message: 'Webhook 端点正常工作，数据库连接成功。请使用 POST 发送实际的 webhook 请求。'
      });
    } else {
      return NextResponse.json({
        status: 'warning',
        message: 'Webhook 端点正常，但数据库连接失败！'
      }, { status: 200 });
    }
  } catch (error) {
    console.error('测试数据库连接时出错:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Webhook 端点正常，但数据库测试失败！',
      error: String(error)
    }, { status: 200 });
  }
}

// 正确验证Creem的签名
function verifySignature(body: string, signature: string): boolean {
  try {
    // 在测试模式下，暂时允许所有请求通过（便于调试）
    if (config.creem.testMode) {
      console.log('测试模式下跳过签名验证');
      return true;
    }

    if (!signature) {
      console.log('未提供签名');
      return false;
    }

    const secretKey = config.creem.secretKey;
    if (!secretKey) {
      console.log('未配置密钥，无法验证签名');
      return false;
    }

    // 使用秘钥和请求体计算HMAC
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(body);
    const computedSignature = hmac.digest('hex');
    
    console.log('签名验证:', {
      headerSignature: signature,
      computedSignature: computedSignature,
      matched: computedSignature === signature
    });
    
    return computedSignature === signature;
  } catch (error) {
    console.error('签名验证过程中出错:', error);
    // 在测试环境中可以返回true便于调试
    return config.creem.testMode;
  }
}

// 处理 checkout.completed 事件
async function handleCheckoutCompleted(event: any) {
  try {
    console.log('支付成功! 详细信息:', JSON.stringify({
      checkoutId: event.object.id,
      customerId: event.object.customer?.id,
      productId: event.object.product?.id,
      amount: event.object.amount || event.object.order?.amount,
      metadata: event.object.metadata
    }, null, 2));
    
    // 从事件中提取需要的数据
    let amount = 6.9; // 默认金额
    
    // 尝试从不同位置获取金额
    if (event.object.amount) {
      amount = parseFloat(event.object.amount) / 100;
    } else if (event.object.order && event.object.order.amount) {
      amount = parseFloat(event.object.order.amount) / 100;
    } else if (event.object.product && event.object.product.price) {
      amount = parseFloat(event.object.product.price) / 100;
    }
    
    console.log(`解析的金额: ${amount}`);
    
    // 获取产品ID - 直接使用完整的productId字符串
    let productId = 'unknown'; // 默认产品ID
    if (event.object.product && event.object.product.id) {
      productId = event.object.product.id; // 直接使用完整的productId
    }
    
    console.log(`使用的产品ID: ${productId}`);
    
    // 获取交易ID - 优先使用元数据中的订单ID
    let transactionId = '';
    if (event.object.metadata && event.object.metadata.orderId) {
      transactionId = event.object.metadata.orderId;
    } else {
      transactionId = event.object.id || event.id;
    }
    
    // 获取用户ID
    let userId = '3'; // 默认用户ID
    
    // 尝试从元数据获取用户ID
    if (event.object.metadata && event.object.metadata.userId) {
      userId = event.object.metadata.userId;
    } else if (event.object.customer && event.object.customer.id) {
      userId = event.object.customer.id;
    }
    
    // 插入支付记录到数据库
    try {
      const result = await insertPayment({
        user_id: userId,
        plan_id: productId, // 使用完整的productId作为plan_id
        amount: amount,
        payment_method: 'creem',
        transaction_id: transactionId,
        status: 1, // 成功
      });
      
      console.log(`支付记录已成功添加到数据库，用户ID: ${userId}, 金额: ${amount}, 产品ID: ${productId}, 结果:`, result);
    } catch (dbError) {
      console.error('插入支付记录时出错:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('处理支付完成事件时出错:', error);
    throw error;
  }
}

// 处理 subscription.active 事件
async function handleSubscriptionActive(event: any) {
  try {
    console.log('订阅已激活!', {
      subscriptionId: event.object.id,
      customerId: event.object.customer?.id,
      productId: event.object.product?.id,
      metadata: event.object.metadata
    });
    
    // 从事件中提取数据
    let productId = 'unknown'; // 默认产品ID
    if (event.object.product && event.object.product.id) {
      productId = event.object.product.id; // 直接使用完整的productId
    }
    
    const transactionId = event.object.id || event.id;
    let userId = '3'; // 默认用户ID
    let amount = 6.9; // 默认金额
    
    // 如果有元数据，尝试从中提取用户ID
    if (event.object.metadata && event.object.metadata.userId) {
      userId = event.object.metadata.userId;
    }
    
    // 如果能获取到产品价格，使用产品价格
    if (event.object.product && event.object.product.price) {
      amount = parseFloat(event.object.product.price) / 100;
    }
    
    // 插入支付记录到数据库
    await insertPayment({
      user_id: userId,
      plan_id: productId, // 使用完整的productId作为plan_id
      amount: amount,
      payment_method: 'creem_subscription',
      transaction_id: transactionId,
      status: 1, // 成功
    });
    
    console.log(`订阅记录已成功添加到数据库，用户ID: ${userId}, 产品ID: ${productId}`);
  } catch (error) {
    console.error('处理订阅激活事件时出错:', error);
    throw error;
  }
}

// 处理 subscription.paid 事件
async function handleSubscriptionPaid(event: any) {
  try {
    console.log('订阅付款已收到!', {
      subscriptionId: event.object.id,
      customerId: event.object.customer?.id,
      productId: event.object.product?.id,
      metadata: event.object.metadata
    });
    
    // 从事件中提取数据
    let productId = 'unknown'; // 默认产品ID
    if (event.object.product && event.object.product.id) {
      productId = event.object.product.id; // 直接使用完整的productId
    }
    
    const transactionId = `${event.object.id}_${Date.now()}` || event.id;
    let userId = '3'; // 默认用户ID
    let amount = 6.9; // 默认金额
    
    // 如果有元数据，尝试从中提取用户ID
    if (event.object.metadata && event.object.metadata.userId) {
      userId = event.object.metadata.userId;
    }
    
    // 如果能获取到产品价格，使用产品价格
    if (event.object.product && event.object.product.price) {
      amount = parseFloat(event.object.product.price) / 100;
    }
    
    // 插入支付记录到数据库
    await insertPayment({
      user_id: userId,
      plan_id: productId, // 使用完整的productId作为plan_id
      amount: amount,
      payment_method: 'creem_subscription_renewal',
      transaction_id: transactionId,
      status: 1, // 成功
    });
    
    console.log(`订阅续费记录已成功添加到数据库，用户ID: ${userId}, 产品ID: ${productId}`);
  } catch (error) {
    console.error('处理订阅付款事件时出错:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 获取请求数据
    const body = await request.text();
    
    // 打印请求头，便于调试
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('收到Webhook请求头:', JSON.stringify(headers, null, 2));
    
    // Creem的签名可能在不同的头部字段中
    const signature = request.headers.get('x-creem-signature') || 
                       request.headers.get('creem-signature') || 
                       request.headers.get('signature') || '';
    
    console.log('获取到的签名:', signature);
    console.log('请求体前100个字符:', body.substring(0, 100));
    
    // 在调试模式下打印完整请求体
    if (config.creem.testMode) {
      console.log('完整请求体:', body);
    }
    
    // 验证签名（测试模式下暂时允许所有请求）
    const isValidSignature = verifySignature(body, signature);
    if (!isValidSignature && !config.creem.testMode) {
      console.error('签名验证失败');
      return new NextResponse(JSON.stringify({ error: '签名验证失败' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 解析请求体
    let event;
    try {
      event = JSON.parse(body);
    } catch (parseError) {
      console.error('解析JSON失败:', parseError);
      return new NextResponse(JSON.stringify({ error: '无效的JSON格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`收到Creem Webhook事件:`, event.type || '未知事件类型');
    
    // 检查事件结构
    if (!event || !event.type) {
      console.log('收到的事件缺少类型信息:', event);
      return new NextResponse(JSON.stringify({ received: true, warning: '事件格式不符合预期' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 根据事件类型分发到不同的处理函数
    switch (event.type) {
      case 'checkout.completed':
        await handleCheckoutCompleted(event);
        break;
      case 'subscription.active':
        await handleSubscriptionActive(event);
        break;
      case 'subscription.paid':
        await handleSubscriptionPaid(event);
        break;
      default:
        console.log(`未处理的事件类型: ${event.type}`);
    }
    
    return new NextResponse(JSON.stringify({ received: true, status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('处理webhook时出错:', error);
    return new NextResponse(JSON.stringify({ 
      error: error.message,
      stack: config.creem.testMode ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 