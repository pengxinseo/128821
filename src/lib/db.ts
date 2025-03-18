import mysql from 'mysql2/promise';

// 数据库连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST || '121.40.216.79',
  user: process.env.MYSQL_USER || 'iuu',
  password: process.env.MYSQL_PASSWORD || 'iuu',
  database: process.env.MYSQL_DATABASE || 'iuu',
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试连接
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功!');
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}

// 执行SQL查询
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('SQL查询执行失败:', error);
    throw error;
  }
}

// 插入支付记录 - 修改为使用 iuu_payment 表
export async function insertPayment({
  user_id,
  plan_id,
  amount,
  payment_method = 'creem',
  transaction_id,
  status = 1, // 默认为成功
}: {
  user_id: string;
  plan_id: number;
  amount: number;
  payment_method?: string;
  transaction_id?: string;
  status?: number;
}) {
  const sql = `
    INSERT INTO iuu_payment 
    (user_id, plan_id, amount, payment_method, transaction_id, status, payment_date) 
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;
  
  const params = [user_id, plan_id, amount, payment_method, transaction_id, status];
  
  try {
    const result = await query(sql, params);
    console.log('支付记录插入成功:', result);
    return result;
  } catch (error) {
    console.error('支付记录插入失败:', error);
    throw error;
  }
}

export default {
  query,
  testConnection,
  insertPayment,
}; 