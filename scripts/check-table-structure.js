const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST || '121.40.216.79',
  user: process.env.MYSQL_USER || 'iuu',
  password: process.env.MYSQL_PASSWORD || 'iuu',
  database: process.env.MYSQL_DATABASE || 'iuu',
};

async function checkTableStructure() {
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
      console.log(`${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key} ${column.Default || 'NULL'}`);
    });

  } catch (error) {
    console.error('检查表结构过程中出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行检查
checkTableStructure(); 