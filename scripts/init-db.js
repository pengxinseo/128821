const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST || '121.40.216.79',
  user: process.env.MYSQL_USER || 'iuu',
  password: process.env.MYSQL_PASSWORD || 'iuu',
  database: process.env.MYSQL_DATABASE || 'iuu',
};

async function initDatabase() {
  let connection;
  try {
    console.log('连接到数据库...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('成功连接到数据库');
    
    // 检查 payments 表是否存在
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'payments'`, 
      [dbConfig.database]
    );
    
    if (tables.length === 0) {
      console.log('创建 payments 表...');
      
      // 创建 payments 表
      await connection.execute(`
        CREATE TABLE payments (
          id INT(11) NOT NULL AUTO_INCREMENT,
          user_id VARCHAR(255) NOT NULL COMMENT '用户ID',
          plan_id INT(11) NOT NULL COMMENT '计划ID',
          amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
          payment_method VARCHAR(50) DEFAULT NULL COMMENT '支付方式',
          transaction_id VARCHAR(255) DEFAULT NULL COMMENT '交易ID',
          status TINYINT(1) DEFAULT 0 COMMENT '状态: 0-处理中, 1-成功, 2-失败',
          payment_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '支付时间',
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
      `);
      
      console.log('payments 表创建成功');
    } else {
      console.log('payments 表已存在');
    }
    
    // 查询表结构以验证
    const [columns] = await connection.execute(`DESCRIBE payments`);
    console.log('payments 表结构：');
    columns.forEach(column => {
      console.log(`${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key}`);
    });
    
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('初始化数据库时出错:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行初始化
initDatabase(); 