const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST || '121.40.216.79',
  user: process.env.MYSQL_USER || 'iuu',
  password: process.env.MYSQL_PASSWORD || 'iuu',
  database: process.env.MYSQL_DATABASE || 'iuu',
};

async function checkPayments() {
  let connection;
  try {
    console.log('连接到数据库...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('成功连接到数据库');
    
    // 检查数据库中的表
    console.log('查询数据库中的表...');
    const [tables] = await connection.execute(
      `SHOW TABLES`
    );
    
    console.log('数据库中的表:');
    tables.forEach(table => {
      console.log(Object.values(table)[0]);
    });
    
    // 检查 iuu_payment 表是否存在
    const paymentTableExists = tables.some(table => 
      Object.values(table)[0].toLowerCase() === 'iuu_payment'
    );
    
    if (!paymentTableExists) {
      console.log('iuu_payment 表不存在! 请确认表名或创建表...');
    } else {
      // 查询支付记录
      console.log('查询支付记录...');
      const [payments] = await connection.execute(
        `SELECT * FROM iuu_payment ORDER BY payment_date DESC`
      );
      
      if (payments.length === 0) {
        console.log('没有找到支付记录');
        
        // 插入一条测试记录
        console.log('插入测试记录...');
        const [result] = await connection.execute(
          `INSERT INTO iuu_payment (user_id, plan_id, amount, payment_method, transaction_id, status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          ['3', 5, 6.9, 'creem_test', 'test_transaction_' + Date.now(), 1]
        );
        
        console.log('测试记录插入结果:', result);
        
        // 再次查询支付记录
        console.log('再次查询支付记录...');
        const [newPayments] = await connection.execute(
          `SELECT * FROM iuu_payment ORDER BY payment_date DESC`
        );
        
        console.log(`找到 ${newPayments.length} 条支付记录:`);
        console.log(JSON.stringify(newPayments, null, 2));
      } else {
        console.log(`找到 ${payments.length} 条支付记录:`);
        console.log(JSON.stringify(payments, null, 2));
      }
    }
    
    console.log('数据库检查完成');
  } catch (error) {
    console.error('查询支付记录时出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行检查
checkPayments(); 