import { NextResponse, NextRequest } from 'next/server';
import * as crypto from 'crypto';
import { insertPayment, testConnection } from '@/lib/db';
import config from '@/config';

// 添加 GET 方法支持用于测试端点
export async function GET(request: Request) {
  console.log('GET 请求收到: 测试 webhook 端点');
  
  // 测试数据库连接
  let dbStatus = '未知';
  let dbMessage = '';
  
  try {
    const connected = await testConnection();
    if (connected) {
      dbStatus = '成功';
      dbMessage = '数据库连接正常';
    } else {
      dbStatus = '失败';
      dbMessage = '数据库连接失败，但端点正常';
    }
  } catch (error) {
    dbStatus = '错误';
    dbMessage = `数据库测试出错: ${error instanceof Error ? error.message : String(error)}`;
  }
  
  // 获取配置状态
  const configStatus = {
    testMode: config.creem.testMode ? '开启' : '关闭',
    secretKeyConfigured: !!config.creem.secretKey ? '已配置' : '未配置',
    database: config.database.host,
  };
  
  // 构建HTML响应
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Creem Webhook 测试页面</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #333; }
      h1 { color: #2563eb; }
      .card { background: #f9fafb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid #e5e7eb; }
      .success { color: #047857; background: #ecfdf5; }
      .warning { color: #92400e; background: #fffbeb; }
      .error { color: #b91c1c; background: #fee2e2; }
      .code { font-family: monospace; background: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 4px; }
      table { width: 100%; border-collapse: collapse; }
      td, th { padding: 0.5rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
      th { font-weight: 600; }
    </style>
  </head>
  <body>
    <h1>Creem Webhook 测试页面</h1>
    
    <div class="card ${dbStatus === '成功' ? 'success' : dbStatus === '失败' ? 'warning' : 'error'}">
      <h2>端点状态</h2>
      <p><strong>Webhook URL:</strong> ${request.url}</p>
      <p><strong>数据库连接:</strong> ${dbStatus}</p>
      <p>${dbMessage}</p>
    </div>
    
    <div class="card">
      <h2>配置信息</h2>
      <table>
        <tr>
          <th>测试模式</th>
          <td>${configStatus.testMode}</td>
        </tr>
        <tr>
          <th>密钥配置</th>
          <td>${configStatus.secretKeyConfigured}</td>
        </tr>
        <tr>
          <th>数据库主机</th>
          <td>${configStatus.database}</td>
        </tr>
      </table>
    </div>
    
    <div class="card">
      <h2>如何使用</h2>
      <p>这个端点用于接收来自Creem的webhook事件通知。</p>
      <p>您应该在Creem管理后台配置以下webhook URL:</p>
      <p class="code">${request.url}</p>
      <p>支持的事件类型:</p>
      <ul>
        <li><strong>checkout.completed</strong> - 支付完成事件</li>
        <li><strong>subscription.active</strong> - 订阅激活事件</li>
        <li><strong>subscription.paid</strong> - 订阅付款事件</li>
      </ul>
    </div>
    
    <div class="card">
      <h2>手动测试</h2>
      <p>您可以使用以下cURL命令发送测试webhook:</p>
      <pre class="code">curl -X POST "${request.url}" \\
  -H "Content-Type: application/json" \\
  -H "creem-signature: test_signature" \\
  -d '{
    "id": "evt_test",
    "eventType": "checkout.completed",
    "created_at": ${Date.now()},
    "object": {
      "id": "ch_test",
      "object": "checkout",
      "product": {
        "id": "prod_5o4cv1dxKuW50AclR6TJI0",
        "price": 490
      },
      "customer": {
        "id": "cust_test"
      },
      "order": {
        "id": "ord_test",
        "amount": 490
      },
      "status": "completed",
      "mode": "test"
    }
  }'</pre>
    </div>
  </body>
  </html>
  `;
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

// 正确验证Creem的签名
function verifySignature(body: string, signature: string): boolean {
  try {
 

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
      eventId: event.id,
      checkoutId: event.object?.id,
      orderId: event.object?.order?.id,
      customerId: event.object?.customer?.id,
      productId: event.object?.product?.id,
      amount: event.object?.order?.amount || event.object?.product?.price,
    }, null, 2));
    
    // 从事件中提取需要的数据
    let amount = 6.9; // 默认金额
    
    // 从订单或产品中获取金额
    if (event.object?.order?.amount) {
      amount = parseFloat(event.object.order.amount) / 100;
    } else if (event.object?.product?.price) {
      amount = parseFloat(event.object.product.price) / 100;
    }
    
    console.log(`解析的金额: ${amount}`);
    
    // 获取产品ID - 直接使用完整的productId字符串
    let productId = 'unknown'; // 默认产品ID
    if (event.object?.product?.id) {
      productId = event.object.product.id; // 直接使用完整的productId
    } else if (event.object?.order?.product) {
      productId = event.object.order.product;
    }
    
    console.log(`使用的产品ID: ${productId}`);
    
    // 获取交易ID - 优先使用订单ID
    let transactionId = '';
    if (event.object?.order?.id) {
      transactionId = event.object.order.id;
    } else {
      transactionId = event.object?.id || event.id || `order_${Date.now()}`;
    }
    
    console.log(`使用的交易ID: ${transactionId}`);
    
    // 获取用户ID
    let userId = '3'; // 默认用户ID
    
    // 从客户信息获取用户ID
    if (event.object?.customer?.id) {
      userId = event.object.customer.id;
    } else if (event.object?.order?.customer) {
      userId = event.object.order.customer;
    }
    
    console.log(`使用的用户ID: ${userId}`);
    
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
    console.log('订阅已激活! 详细信息:', JSON.stringify({
      eventId: event.id,
      subscriptionId: event.object?.id,
      customerId: event.object?.customer?.id,
      productId: event.object?.product?.id,
    }, null, 2));
    
    // 从事件中提取数据
    let productId = 'unknown'; // 默认产品ID
    if (event.object?.product?.id) {
      productId = event.object.product.id; // 直接使用完整的productId
    }
    
    const transactionId = event.object?.id || event.id || `sub_${Date.now()}`;
    let userId = '3'; // 默认用户ID
    let amount = 6.9; // 默认金额
    
    // 从客户信息获取用户ID
    if (event.object?.customer?.id) {
      userId = event.object.customer.id;
    }
    
    // 如果能获取到产品价格，使用产品价格
    if (event.object?.product?.price) {
      amount = parseFloat(event.object.product.price) / 100;
    }
    
    console.log(`订阅信息: 用户ID=${userId}, 产品ID=${productId}, 金额=${amount}, 交易ID=${transactionId}`);
    
    // 插入支付记录到数据库
    try {
      const result = await insertPayment({
        user_id: userId,
        plan_id: productId, // 使用完整的productId作为plan_id
        amount: amount,
        payment_method: 'creem_subscription',
        transaction_id: transactionId,
        status: 1, // 成功
      });
      
      console.log(`订阅记录已成功添加到数据库，用户ID: ${userId}, 产品ID: ${productId}, 结果:`, result);
    } catch (dbError) {
      console.error('插入订阅记录时出错:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('处理订阅激活事件时出错:', error);
    throw error;
  }
}

// 处理 subscription.paid 事件
async function handleSubscriptionPaid(event: any) {
  try {
    console.log('订阅付款已收到! 详细信息:', JSON.stringify({
      eventId: event.id,
      subscriptionId: event.object?.id,
      customerId: event.object?.customer?.id,
      productId: event.object?.product?.id,
      amount: event.object?.amount || event.object?.product?.price
    }, null, 2));
    
    // 从事件中提取数据
    let productId = 'unknown'; // 默认产品ID
    if (event.object?.product?.id) {
      productId = event.object.product.id; // 直接使用完整的productId
    }
    
    const transactionId = `${event.object?.id || event.id}_${Date.now()}`;
    let userId = '3'; // 默认用户ID
    let amount = 6.9; // 默认金额
    
    // 从客户信息获取用户ID
    if (event.object?.customer?.id) {
      userId = event.object.customer.id;
    }
    
    // 如果能获取到产品价格，使用产品价格
    if (event.object?.product?.price) {
      amount = parseFloat(event.object.product.price) / 100;
    } else if (event.object?.amount) {
      amount = parseFloat(event.object.amount) / 100;
    }
    
    console.log(`订阅付款信息: 用户ID=${userId}, 产品ID=${productId}, 金额=${amount}, 交易ID=${transactionId}`);
    
    // 插入支付记录到数据库
    try {
      const result = await insertPayment({
        user_id: userId,
        plan_id: productId, // 使用完整的productId作为plan_id
        amount: amount,
        payment_method: 'creem_subscription_renewal',
        transaction_id: transactionId,
        status: 1, // 成功
      });
      
      console.log(`订阅续费记录已成功添加到数据库，用户ID: ${userId}, 产品ID: ${productId}, 结果:`, result);
    } catch (dbError) {
      console.error('插入订阅续费记录时出错:', dbError);
      throw dbError;
    }
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
    
    // Creem使用eventType字段而不是type字段
    const eventType = event.eventType || event.type || null;
    console.log(`收到Creem Webhook事件: ${eventType || '未知事件类型'}`);
    
    // 检查事件结构
    if (!eventType) {
      console.log('收到的事件缺少类型信息:', event);
      return new NextResponse(JSON.stringify({ received: true, warning: '事件格式不符合预期' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 根据事件类型分发到不同的处理函数
    switch (eventType) {
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
        console.log(`未处理的事件类型: ${eventType}`);
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