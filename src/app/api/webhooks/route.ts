import { NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { insertPayment, testConnection } from '@/lib/db';

// Creem webhook secret for signature verification
const WEBHOOK_SECRET = 'whsec_7ZEElvFDehBMvfrtiQ8wUv';

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

export async function POST(request: Request) {
  try {
    // 获取原始请求体用于签名验证
    const body = await request.text();
    const jsonBody = JSON.parse(body);
    
    // 获取 Creem 签名
    const signature = request.headers.get('creem-signature');
    
    // 验证签名
    let signatureValid = true;
    if (signature) {
      try {
        signatureValid = verifySignature(body, signature, WEBHOOK_SECRET);
        if (!signatureValid) {
          console.error('无效签名');
          return NextResponse.json({ error: '无效签名' }, { status: 401 });
        } else {
          console.log('签名验证成功');
        }
      } catch (signatureError) {
        console.error('签名验证失败:', signatureError);
        // 在测试阶段，我们继续处理，但在生产环境中，你可能想在这里返回错误
      }
    } else {
      console.log('没有提供签名');
    }
    
    // 处理不同的事件类型
    const eventType = jsonBody.eventType;
    
    console.log('Webhook 收到:', {
      eventType,
      id: jsonBody.id,
      created_at: jsonBody.created_at,
      object: jsonBody.object ? {
        id: jsonBody.object.id,
        type: jsonBody.object.object,
      } : null
    });
    
    // 根据事件类型处理 webhook
    switch (eventType) {
      case 'checkout.completed':
        await handleCheckoutCompleted(jsonBody);
        break;
      case 'subscription.active':
        await handleSubscriptionActive(jsonBody);
        break;
      case 'subscription.paid':
        await handleSubscriptionPaid(jsonBody);
        break;
      default:
        console.log(`未处理的事件类型: ${eventType}`);
    }
    
    return NextResponse.json({ received: true, status: 'success' });
  } catch (error) {
    console.error('Webhook 处理错误:', error);
    return NextResponse.json(
      { error: 'Webhook 处理失败', details: String(error) },
      { status: 500 }
    );
  }
}

// 验证签名函数
function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // 安全比较两个签名
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(signature)
    );
  } catch (error) {
    console.error('验证签名时出错:', error);
    return false;
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
    
    // 获取产品ID
    let productId = 1; // 默认产品ID
    if (event.object.product && event.object.product.id) {
      const productIdMatch = event.object.product.id.match(/\d+/);
      if (productIdMatch) {
        productId = parseInt(productIdMatch[0], 10);
      } else {
        productId = 5; // 如果无法解析，使用5作为默认值
      }
    }
    
    console.log(`解析的产品ID: ${productId}`);
    
    // 获取交易ID
    const transactionId = event.object.id || event.id;
    
    // 获取用户ID
    let userId = '3'; // 默认用户ID
    
    // 如果有元数据，尝试从中提取用户ID
    if (event.object.metadata && event.object.metadata.userId) {
      userId = event.object.metadata.userId;
    }
    
    console.log(`使用的用户ID: ${userId}`);
    
    // 测试数据库连接
    const testResult = await testConnection();
    console.log(`数据库连接测试结果: ${testResult ? '成功' : '失败'}`);
    
    if (!testResult) {
      throw new Error('数据库连接失败');
    }
    
    // 插入支付记录到数据库
    try {
      const result = await insertPayment({
        user_id: userId,
        plan_id: productId,
        amount: amount,
        payment_method: 'creem',
        transaction_id: transactionId,
        status: 1, // 成功
      });
      
      console.log(`支付记录已成功添加到数据库，用户ID: ${userId}, 金额: ${amount}, 结果:`, result);
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
    const productId = event.object.product?.id ? parseInt(event.object.product.id.replace(/\D/g, ''), 10) : 1;
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
      plan_id: productId,
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
    const productId = event.object.product?.id ? parseInt(event.object.product.id.replace(/\D/g, ''), 10) : 1;
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
      plan_id: productId,
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