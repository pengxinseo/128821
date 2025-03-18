const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST || '121.40.216.79',
  user: process.env.MYSQL_USER || 'iuu',
  password: process.env.MYSQL_PASSWORD || 'iuu',
  database: process.env.MYSQL_DATABASE || 'iuu',
};

async function alterPaymentTable() {
  let connection;
  try {
    console.log('连接到数据库...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('成功连接到数据库');
    
    // 查询修改前的表结构
    console.log('查询修改前的 iuu_payment 表结构...');
    const [beforeColumns] = await connection.execute('DESCRIBE iuu_payment');
    
    console.log('修改前的 iuu_payment 表结构:');
    beforeColumns.forEach(column => {
      console.log(`${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key} ${column.Default || 'NULL'}`);
    });
    
    // 修改表结构 - 将 plan_id 从 int(11) 改为 varchar(255)
    console.log('\n修改 plan_id 字段类型为 varchar(255)...');
    
    try {
      await connection.execute('ALTER TABLE iuu_payment MODIFY COLUMN plan_id VARCHAR(255) NOT NULL');
      console.log('表结构修改成功!');
    } catch (alterError) {
      console.error('修改表结构失败:', alterError);
      return;
    }
    
    // 查询修改后的表结构
    console.log('\n查询修改后的 iuu_payment 表结构...');
    const [afterColumns] = await connection.execute('DESCRIBE iuu_payment');
    
    console.log('修改后的 iuu_payment 表结构:');
    afterColumns.forEach(column => {
      console.log(`${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key} ${column.Default || 'NULL'}`);
    });
    
    // 查询表中现有数据
    console.log('\n查询现有数据...');
    const [existingData] = await connection.execute('SELECT * FROM iuu_payment');
    
    console.log(`当前表中有 ${existingData.length} 条记录:`);
    existingData.forEach((record, index) => {
      console.log(`[${index + 1}] ID: ${record.id}, User: ${record.user_id}, Plan: ${record.plan_id}, Transaction: ${record.transaction_id}`);
    });

  } catch (error) {
    console.error('修改表结构过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

// 执行表结构修改
alterPaymentTable(); 