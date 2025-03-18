const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST || '121.40.216.79',
  user: process.env.MYSQL_USER || 'iuu',
  password: process.env.MYSQL_PASSWORD || 'iuu',
  database: process.env.MYSQL_DATABASE || 'iuu',
};

async function insertTestPayment() {
  let connection;
  try {
    console.log('连接到数据库...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('成功连接到数据库');
    
    // 查询表结构
    console.log('查询 iuu_payment 表结构...');
    const [columns] = await connection.execute('DESCRIBE iuu_payment');
    
    console.log('iuu_payment 表结构:');
    columns.forEach(column => {
      console.log(`${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key}`);
    });
    
    // 插入测试记录
    console.log('插入测试记录...');
    const orderIdTimestamp = Date.now();
    const testOrderId = `order_${orderIdTimestamp}`;
    
    const [result] = await connection.execute(
      `INSERT INTO iuu_payment (user_id, plan_id, amount, payment_method, transaction_id, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['3', 5, 6.9, 'script_test', testOrderId, 1]
    );
    
    console.log('测试记录插入结果:', result);
    
    // 查询刚才插入的记录
    console.log('查询刚才插入的记录...');
    const [payment] = await connection.execute(
      `SELECT * FROM iuu_payment WHERE transaction_id = ?`,
      [testOrderId]
    );
    
    if (payment.length > 0) {
      console.log('成功找到刚插入的记录:', payment[0]);
    } else {
      console.log('未能找到刚插入的记录');
    }
    
    // 查询所有记录
    console.log('查询所有支付记录...');
    const [allPayments] = await connection.execute('SELECT * FROM iuu_payment');
    
    console.log(`共找到 ${allPayments.length} 条支付记录`);
    allPayments.forEach((p, index) => {
      console.log(`记录 ${index + 1}:`, p);
    });
    
    console.log('测试完成');
  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行测试
insertTestPayment(); 