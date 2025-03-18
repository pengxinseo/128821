const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST || '121.40.216.79',
  user: process.env.MYSQL_USER || 'iuu',
  password: process.env.MYSQL_PASSWORD || 'iuu',
  database: process.env.MYSQL_DATABASE || 'iuu',
};

async function updatePaymentId() {
  let connection;
  try {
    console.log('连接到数据库...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('成功连接到数据库');
    
    // 旧的交易ID
    const oldTransactionId = 'ch_5G1JntMQdaVtlNL6IpqEs1';
    // 新的订单ID 
    const newOrderId = 'order_1742259836979';
    
    // 首先检查记录是否存在
    console.log(`检查交易ID为 ${oldTransactionId} 的记录...`);
    const [existingPayment] = await connection.execute(
      `SELECT * FROM iuu_payment WHERE transaction_id = ?`,
      [oldTransactionId]
    );
    
    if (existingPayment.length === 0) {
      console.log('未找到指定的交易记录');
      return;
    }
    
    console.log('找到记录:', existingPayment[0]);
    
    // 更新交易ID
    console.log(`更新交易ID为 ${newOrderId}...`);
    const [updateResult] = await connection.execute(
      `UPDATE iuu_payment SET transaction_id = ? WHERE transaction_id = ?`,
      [newOrderId, oldTransactionId]
    );
    
    console.log('更新结果:', updateResult);
    
    // 检查更新后的记录
    console.log('查询更新后的记录...');
    const [updatedPayment] = await connection.execute(
      `SELECT * FROM iuu_payment WHERE transaction_id = ?`,
      [newOrderId]
    );
    
    if (updatedPayment.length > 0) {
      console.log('成功更新记录:', updatedPayment[0]);
    } else {
      console.log('未找到更新后的记录');
    }
    
    // 查询所有支付记录
    console.log('查询所有支付记录...');
    const [allPayments] = await connection.execute('SELECT * FROM iuu_payment');
    
    console.log(`共找到 ${allPayments.length} 条支付记录`);
    allPayments.forEach((p, index) => {
      console.log(`记录 ${index + 1}:`, p);
    });
    
    console.log('更新完成');
  } catch (error) {
    console.error('更新过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行更新
updatePaymentId(); 