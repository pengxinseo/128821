// 应用配置，从环境变量中读取
const config = {
  // Creem API配置
  creem: {
    apiKey: process.env.CREEM_API_KEY || 'your_creem_api_key_here',
    secretKey: process.env.CREEM_SECRET_KEY || 'your_creem_secret_key_here',
    testMode: process.env.CREEM_TEST_MODE === 'true',
    products: {
      basic: {
        id: process.env.CREEM_PRODUCT_BASIC || 'prod_5o4cv1dxKuW50AclR6TJI0',
        price: parseFloat(process.env.CREEM_PRICE_BASIC || '6.9'),
      },
      standard: {
        id: process.env.CREEM_PRODUCT_STANDARD || 'prod_3xcabwSF8FhPyZFr4D94rQ',
        price: parseFloat(process.env.CREEM_PRICE_STANDARD || '19.9'),
      }
    },
    // 构建支付URL
    baseUrl: {
      test: 'https://www.creem.io/test/payment/',
      production: 'https://www.creem.io/payment/',
    },
  },
  
  // 数据库配置
  database: {
    host: process.env.MYSQL_HOST || '121.40.216.79',
    user: process.env.MYSQL_USER || 'iuu',
    password: process.env.MYSQL_PASSWORD || 'iuu',
    database: process.env.MYSQL_DATABASE || 'iuu',
  },
  
  // 应用设置
  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
};

// 工具函数
export const getPaymentUrl = (productId: string): string => {
  const baseUrl = config.creem.testMode
    ? config.creem.baseUrl.test
    : config.creem.baseUrl.production;
  return `${baseUrl}${productId}`;
};

export default config; 