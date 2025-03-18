const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST || '121.40.216.79',
  user: process.env.MYSQL_USER || 'iuu',
  password: process.env.MYSQL_PASSWORD || 'iuu',
  database: process.env.MYSQL_DATABASE || 'iuu',
};

async function testProductIdInsert() {
  let connection;
  try {
    console.log('连接到数据库...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('成功连接到数据库');
    
    // 生成测试数据
    const timestamp = Date.now();
    const testProductId = 'prod_5o4cv1dxKuW50AclR6TJI0'; // 使用示例中的完整productId
    const testOrderId = `order_${timestamp}`;
    
    // 插入测试记录
    console.log(`\n插入测试记录 (productId: ${testProductId})...`);
    const [insertResult] = await connection.execute(
      `INSERT INTO iuu_payment (user_id, plan_id, amount, payment_method, transaction_id, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['3', testProductId, 6.9, 'test_creem', testOrderId, 1]
    );
    
    console.log('插入结果:', insertResult);
    console.log(`新记录ID: ${insertResult.insertId}`);
    
    // 查询刚插入的记录
    console.log('\n查询刚插入的记录...');
    const [newRecord] = await connection.execute(
      'SELECT * FROM iuu_payment WHERE id = ?', 
      [insertResult.insertId]
    );
    
    if (newRecord.length > 0) {
      console.log('新记录详情:');
      console.log(JSON.stringify(newRecord[0], null, 2));
      
      // 验证productId是否正确保存
      const savedProductId = newRecord[0].plan_id;
      if (savedProductId === testProductId) {
        console.log(`\n✅ 成功! productId正确保存为: "${savedProductId}"`);
      } else {
        console.log(`\n❌ 失败! productId保存为: "${savedProductId}", 期望值为: "${testProductId}"`);
      }
    } else {
      console.log('未找到新插入的记录!');
    }
    
    // 查询所有记录
    console.log('\n所有支付记录:');
    const [allRecords] = await connection.execute('SELECT * FROM iuu_payment');
    
    console.log(`共 ${allRecords.length} 条记录:`);
    allRecords.forEach((record, index) => {
      console.log(`[${index + 1}] ID: ${record.id}, User: ${record.user_id}, Plan: ${record.plan_id}, Transaction: ${record.transaction_id}`);
    });

  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

// 执行测试
testProductIdInsert(); 