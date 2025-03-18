import { NextResponse } from 'next/server';

// This is using the real Creem API with test mode
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Use real Creem API with test API key
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
          userId: body.userId || 'user_123',
          orderId: body.orderId || `order_${Date.now()}`
        }
      })
    });
    
    const responseData = await response.json();
    console.log('Checkout session created:', responseData);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 