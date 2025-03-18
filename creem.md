Get Started
Standard Integration
Learn how to receive payments on your application

​
Prerequisites
To get the most out of this guide, you’ll need to:

Create an account on Creem.io
Have your API key ready
​
1. Create a product
Go over to the products tab and create a product. You can add a name, description, and price to your product. Optionally you can also add a picture to your product that will be shown to users.


Product page


Adding product details

​
2 Create a checkout session
Once your product is created, you can copy the product ID by clicking on the product options and selecting “Copy ID”.

Now grab your api-key and create a checkout session by sending a POST request to the following endpoint:


getCheckout.sh

getCheckout.js

Copy
curl -X POST https://api.creem.io/v1/checkouts \
  -H "x-api-key: creem_123456789"
  -D '{"product_id": "prod_6tW66i0oZM7w1qXReHJrwg"}'
Read more about all attributes you can pass to a checkout sesssion here

​
3. Redirect user to checkout url
Once you have created a checkout session, you will receive a checkout URL in the response.

Redirect the user to this URL and that is it! You have successfully created a checkout session and received your first payment!


Track payments with a request ID


Set a success URL on the checkout session

​
4. Receive payment data on your Return URL
A return URL will always contain the following query parameters, and will look like the following:

https://yourwebsite.com/your-return-path?checkout_id=ch_1QyIQDw9cbFWdA1ry5Qc6I&order_id=ord_4ucZ7Ts3r7EhSrl5yQE4G6&customer_id=cust_2KaCAtu6l3tpjIr8Nr9XOp&subscription_id=sub_ILWMTY6uBim4EB0uxK6WE&product_id=prod_6tW66i0oZM7w1qXReHJrwg&signature=044bd1691d254c4ad4b31b7f246330adf09a9f07781cd639979a288623f4394c?

You can read more about Return Urls here.

Query parameter	Description
checkout_id	The ID of the checkout session created for this payment.
order_id	The ID of the order created after successful payment.
customer_id	The customer ID, based on the email that executed the successful payment.
subscription_id	The subscription ID of the product.
product_id	The product ID that the payment is related to.
request_id	Optional The request ID you provided when creating this checkout session.
signature	All previous parameters signed by creem using your API-key, verifiable by you.
We also encourage reading on how you can verify Creem signature on return URLs here.

​
Expanding your integration
You can also use webhooks to check payment data dynamically in your application, without the need to wait for the return URLs, or have the user redirected to your application website.

Return URLs
Understand what you will receive when users complete a payment and get redirected back to your website.

Webhooks and Events
Set up webhooks to receive updates on your application automatically.

Quickstart
Api Keys
x
linkedin
 

 Get Started
Api Keys
Learn how to generate and use your API key

​
What is an API Key
API Keys are secret tokens used to authenticate your requests. They are unique to your account and should be kept confidential.

​
Create API Key
Go over to the dashboard and login to your account.

On the top navbar, navigate to the “Developers” section.

Click on the eye icon to reveal your API key.

Copy your API key and keep it safe.


Standard Integration
Test Mode
x
linkedin
Powered by Mintlify



Test Mode
Simulate payments and any functionality in a test environment

​
Activating Test Mode
To use the test environment, simply click on the test mode button on the top navbar of the dashboard.


All functionality on Creem will now be in test mode. You can create products, checkout sessions, and receive payments without any real money being involved.

Webhooks and API keys that you will see on the Developer tab will also be exclusively for the test environment.

​
Using Test APIs
You can test and use any workflows for the test environment by using the test API endpoint:


Copy
https://test-api.creem.io
​
Testing Payments
Use the test card 4242 4242 4242 4242 with any expiration and CVV

Api Keys
Introduction
x
linkedin


Checkout Session
Introduction
Create checkout sessions for each payment and user independently.


​
Why use a checkout session?
With checkout sessions generated dynamically instead of just using a product payment link, you are able to pass a request_id to the session.

This allows you to track the payment status and the user that made the payment in your system in a more organized way, and gives you the flexibility to track that payment with any ID you choose instead of relying on Creem IDs.

​
Create a checkout session
You can create a checkout session with a product ID

You can find a product ID by going to the products tab and clicking on the product options and selecting “Copy ID”.

Additionally, you can pass a request_id to the session to track the payment in your system. You will also need the API key to authenticate the request.


getCheckout.js

getCheckout.sh

Copy
curl -X POST https://api.creem.io/v1/checkouts \
  -H "x-api-key: creem_123456789"
  -D '{
    "product_id": "prod_6tW66i0oZM7w1qXReHJrwg",
    "request_id": "your-request-id"
    }'
The above request will return a checkout session object with a checkout_url that you can use to redirect the user to the payment page.

Any payments made with this checkout session will have the request_id you provided on the Redirect URL, as well as the webhook event.

​
Metadata
The request_id is only returned in the checkout.completed webhook (which is very useful for one-time payments), but it’s not sent with every new subscription transaction.

To make things easier, we also allow you to pass metadata in a checkoutSession with or without the request_id. This metadata will be saved in the Subscription object and returned with every subsequent webhook.


getCheckout.js

getCheckout.sh

Copy
curl -X 'POST' \
  'https://test-api.creem.io/v1/checkouts' \
    -H 'accept: application/json' \
    -H 'x-api-key: creem_123456789' \
    -H 'Content-Type: application/json' \
    -d '{
      "request_id": "your-request-id",
      "product_id": "prod_your-product-id",
      "metadata": {
        "userId": "my_internal_customer_id",
        "any_key": "any_value"
        }
    }'
​
Success URL
You can pass a custom success_url for each checkout_session, which will override the success_url set on the product.

This allows you to dynamically redirect users to custom pages after each payment (useful for directing users to their specific account resources after payment).


getCheckout.js

getCheckout.sh

Copy
curl -X 'POST' \
  'https://test-api.creem.io/v1/checkouts' \
    -H 'accept: application/json' \
    -H 'x-api-key: creem_123456789' \
    -H 'Content-Type: application/json' \
    -d '{
      "product_id": "prod_your-product-id",
      "success_url": "https://example.com",
    }'
​
Customer Email
You can pass a customer.email directly in the checkout session. This email will be pre-filled for the user on the checkout session page and cannot be changed.

This is useful if you want to ensure that the user completes the payment using the email they registered on your platform.


getCheckout.js

getCheckout.sh

Copy
curl -X 'POST' \
  'https://test-api.creem.io/v1/checkouts' \
    -H 'accept: application/json' \
    -H 'x-api-key: creem_123456789' \
    -H 'Content-Type: application/json' \
    -d '{
      "product_id": "prod_your-product-id",
      "customer": {
        "email": "yourUserEmail@gmail.com"
      },
    }'
​
Discount Codes
You can pass a discount_code directly in the checkout session. This discount code will be pre-filled for the user on the checkout session page.


getCheckout.js

getCheckout.sh

Copy
curl -X 'POST' \
  'https://test-api.creem.io/v1/checkouts' \
    -H 'accept: application/json' \
    -H 'x-api-key: creem_123456789' \
    -H 'Content-Type: application/json' \
    -d '{
      "product_id": "prod_your-product-id",
      "discount_code": "BF200XX",
    }'
​
Seat Based Billing
You can pass a units amount directly in the checkout session. The product price will be used as the base price for one seat/unit of the product and the checkout session will reflect the (base price x units) to be charged.


getCheckout.js

getCheckout.sh

Copy
curl -X 'POST' \
  'https://test-api.creem.io/v1/checkouts' \
    -H 'accept: application/json' \
    -H 'x-api-key: creem_123456789' \
    -H 'Content-Type: application/json' \
    -d '{
      "product_id": "prod_your-product-id",
      "units": 2,
    }'
Test Mode



Checkout Session
Return URLs
Understand how to redirect users back to your website after a successful payment.

​
What is a Return/Redirect URL?
Return and Redirect URLs, are urls that your customer will be redirected to, after a successful payment. They contain important information signed by creem, that you can use to verify the payment and the user.

Using these URLs, you can create a seamless experience for your users, by redirecting them back to your website after a successful payment.

You have the optionality to use the information in the URL query parameters, or to use webhooks to receive updates on your application automatically, or both.

​
How to set a Return/Redirect URL

Option 1: Set a success URL on the product creation.


Option 2: Set a success URL when creating a checkout session

​
What is included on the Return URL?
A return URL will always contain the following query parameters, and will look like the following:

https://yourwebsite.com?checkout_id=ch_1QyIQDw9cbFWdA1ry5Qc6I&order_id=ord_4ucZ7Ts3r7EhSrl5yQE4G6&customer_id=cust_2KaCAtu6l3tpjIr8Nr9XOp&subscription_id=sub_ILWMTY6uBim4EB0uxK6WE&product_id=prod_6tW66i0oZM7w1qXReHJrwg&signature=044bd1691d254c4ad4b31b7f246330adf09a9f07781cd639979a288623f4394c?

Query parameter	Description
checkout_id	The ID of the checkout session created for this payment.
order_id	The ID of the order created after successful payment.
customer_id	The customer ID, based on the email that executed the successful payment.
subscription_id	The subscription ID of the product.
product_id	The product ID that the payment is related to.
request_id	Optional The request ID you provided when creating this checkout session.
signature	All previous parameters signed by creem using your API-key, verifiable by you.
​
How to verify Creem signature?
To verify the signature, you can use the following code snippet:


Copy
export interface RedirectParams {
  request_id?: string | null;
  checkout_id?: string | null;
  order_id?: string | null;
  customer_id?: string | null;
  subscription_id?: string | null;
  product_id?: string | null;
}

  private generateSignature(params: RedirectParams, apiKey: string): string {
    const data = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('|');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
In summary, concatenate all parameters and the salt (your API-key) with a | separator, and hash it using SHA256. This will generate a signature that you can compare with the signature provided in the URL.

Introduction
Introduction
x
linkedin
Powered by Mintlify


Webhooks
Introduction
Use webhooks to notify your application about payment events.”

​
What is a webhook?
Creem uses webhooks to push real-time notifications to you about your payments and subscriptions. All webhooks use HTTPS and deliver a JSON payload that can be used by your application. You can use webhook feeds to do things like:

Automatically enable access to a user after a successful payment
Automatically remove access to a user after a canceled subscription
Confirm that a payment has been received by the same customer that initiated it.
In case webhooks are not successfully received by your endpoint, creem automatically retries to send the request with a progressive backoff period of 30 seconds, 1 minute, 5 minutes and 1 hour.

​
Steps to receive a webhook
You can start receiving real-time events in your app using the steps:

Create a local endpoint to receive requests
Register your development webhook endpoint on the Developers tab of the Creem dashboard
Test that your webhook endpoint is working properly using the test environment
Deploy your webhook endpoint to production
Register your production webhook endpoint on Creem live dashboard
​
1. Create a local endpoint to receive requests
In your local application, create a new route that can accept POST requests.

For example, you can add an API route on Next.js:


Copy
import type { NextApiRequest, NextApiResponse } from 'next';

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const payload = req.body;
    console.log(payload);
    res.status(200);
  }
};
On receiving an event, you should respond with an HTTP 200 OK to signal to Creem that the event was successfully delivered.

​
2. Register your development webhook endpoint
Register your publicly accessible HTTPS URL in the Creem dashboard.

You can create a tunnel to your localhost server using a tool like ngrok. For example: https://8733-191-204-177-89.sa.ngrok.io/api/webhooks


​
3. Test that your webhook endpoint is working properly
Create a few test payments to check that your webhook endpoint is receiving the events.

​
4. Deploy your webhook endpoint
After you’re done testing, deploy your webhook endpoint to production.

​
5. Register your production webhook endpoint
Once your webhook endpoint is deployed to production, you can register it in the Creem dashboard.

Return URLs
Event Types
x
linkedin


oks
Event Types
List of supported event types and their payloads.

​
checkout.completed
A checkout session was completed, returning all the information about the payment and the order created.


Sample Request Body

​
subscription.active
Received when a new subscription is created, the payment was successful and Creem collected the payment creating a new subscription object in your account. Use only for synchronization, we encourage using subscription.paid for activating access.


Sample Request Body


Copy
{
  "id": "evt_6EptlmjazyGhEPiNQ5f4lz",
  "eventType": "subscription.active",
  "created_at": 1728734325927,
  "object": {
      "id": "sub_21lfZb67szyvMiXnm6SVi0",
      "object": "subscription",
      "product": {
          "id": "prod_AnVJ11ujp7x953ARpJvAF",
          "name": "My Product - Product 01",
          "description": "Test my product",
          "image_url": null,
          "price": 10000,
          "currency": "EUR",
          "billing_type": "recurring",
          "billing_period": "every-month",
          "status": "active",
          "tax_mode": "inclusive",
          "tax_category": "saas",
          "default_success_url": "",
          "created_at": "2024-09-16T16:12:09.813Z",
          "updated_at": "2024-09-16T16:12:09.813Z",
          "mode": "local"
      },
      "customer": {
          "id": "cust_3biFPNt4Cz5YRDSdIqs7kc",
          "object": "customer",
          "email": "tester@gmail.com",
          "name": "Tester Test",
          "country": "SE",
          "created_at": "2024-09-16T16:13:39.265Z",
          "updated_at": "2024-09-16T16:13:39.265Z",
          "mode": "local"
      },
      "collection_method": "charge_automatically",
      "status": "active",
      "canceled_at": "2024-09-16T19:40:41.984Z",
      "created_at": "2024-09-16T19:40:41.984Z",
      "updated_at": "2024-09-16T19:40:42.121Z",
      "mode": "local"
  }
}
​
subscription.paid
A subscription transaction was paid by the customer


Sample Request Body

​
subscription.canceled
The subscription was canceled by the merchant or by the customer.


Sample Request Body

​
subscription.expired
The subscription was expired, given that the current_end_period has been reached without a new payment. Payment retries can happen at this stage, and the subscription status will be terminal only when status is changed to canceled.


Sample Request Body

​
refund.created
A refund was created by the merchant


Sample Request Body

​
subscription.update
A subscription object was updated


Sample Request Body

​
subscription.trialing
A subscription started a trial period


Sample Request Body

Introduction
Verify Webhook Requests
x
linkedin

Webhooks
Verify Webhook Requests
How to verify Creem signature on webhook objects.

​
How to verify Creem signature?
Creem signature is sent in the creem-signature header of the webhook request. The signature is generated using the HMAC-SHA256 algorithm with the webhook secret as the key, and the request payload as the message.


Sample Webhook Header

To verify the signature, you need to generate the signature using the same algorithm and compare it with the signature sent in the header. If the two signatures match, the request is authentic.

You can find your webhook secret on the Developers>Webhook page.


To generate the signature, you can use the following code snippet:


Copy
import * as crypto from 'crypto';

  generateSignature(payload: string, secret: string): string {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return computedSignature;
  }
In the code snippet above, the payload is the request body, and the secret is the webhook secret. Simply compare the generated Signature with the one received on the header to complete the verification process.

Event Types
Seat Based Billing
x
linkedin