import { NextResponse } from 'next/server';
import * as crypto from 'crypto';

// This is your webhook secret from Creem dashboard
// In a real app, store this in environment variables
const WEBHOOK_SECRET = 'your_webhook_secret';

export async function POST(request: Request) {
  try {
    // Get the raw request body for signature verification
    const body = await request.text();
    const jsonBody = JSON.parse(body);
    
    // Get the Creem signature from headers
    const signature = request.headers.get('creem-signature');
    
    // Verify the signature in a real implementation
    // if (signature) {
    //   const isValid = verifySignature(body, signature, WEBHOOK_SECRET);
    //   if (!isValid) {
    //     console.error('Invalid signature');
    //     return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    //   }
    // }
    
    // Handle different event types
    const eventType = jsonBody.eventType;
    
    console.log('Webhook received:', {
      eventType,
      id: jsonBody.id,
      created_at: jsonBody.created_at,
      object: jsonBody.object
    });
    
    // Process the webhook based on the event type
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
        console.log(`Unhandled event type: ${eventType}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Function to verify the signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(computedSignature),
    Buffer.from(signature)
  );
}

// Handle checkout.completed event
async function handleCheckoutCompleted(event: any) {
  console.log('Payment successful!', {
    checkoutId: event.object.id,
    customerId: event.object.customer?.id,
    productId: event.object.product?.id,
    amount: event.object.amount,
    metadata: event.object.metadata
  });
  
  // Here you would update your database
  // For example:
  // await db.users.update({
  //   where: { id: event.object.metadata.userId },
  //   data: { hasPaid: true, subscriptionId: event.object.subscription?.id }
  // });
}

// Handle subscription.active event
async function handleSubscriptionActive(event: any) {
  console.log('Subscription is now active!', {
    subscriptionId: event.object.id,
    customerId: event.object.customer?.id,
    productId: event.object.product?.id,
    metadata: event.object.metadata
  });
  
  // Here you would update your database to mark the subscription as active
}

// Handle subscription.paid event
async function handleSubscriptionPaid(event: any) {
  console.log('Subscription payment received!', {
    subscriptionId: event.object.id,
    customerId: event.object.customer?.id,
    productId: event.object.product?.id,
    metadata: event.object.metadata
  });
  
  // Here you would update your database to record the payment
} 