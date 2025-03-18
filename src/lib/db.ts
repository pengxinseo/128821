import mysql from 'mysql2/promise';
import config from '@/config';

// 数据库连接配置
const dbConfig = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  // 添加连接配置，提高稳定性
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试连接
export async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('数据库连接成功!');
    
    // 执行简单查询验证连接
    const [result] = await connection.execute('SELECT 1 as value');
    console.log('连接验证结果:', result);
    
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 执行SQL查询
export async function query(sql: string, params: any[] = []) {
  let connection;
  try {
    // 获取连接
    connection = await pool.getConnection();
    console.log(`执行SQL查询: ${sql} 参数:`, params);
    
    // 执行查询
    const [results] = await connection.execute(sql, params);
    console.log(`查询结果行数: ${Array.isArray(results) ? results.length : 0}`);
    
    return results;
  } catch (error) {
    console.error('SQL查询执行失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 插入支付记录 - 使用 iuu_payment 表
export async function insertPayment({
  user_id,
  plan_id,
  amount,
  payment_method = 'creem',
  transaction_id,
  status = 1, // 默认为成功
}: {
  user_id: string;
  plan_id: string | number; // 支持字符串或数字类型
  amount: number;
  payment_method?: string;
  transaction_id?: string;
  status?: number;
}) {
  let connection;
  try {
    // 获取连接
    connection = await pool.getConnection();
    
    const sql = `
      INSERT INTO iuu_payment 
      (user_id, plan_id, amount, payment_method, transaction_id, status, payment_date) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const params = [user_id, plan_id, amount, payment_method, transaction_id, status];
    
    console.log('执行插入支付记录SQL:', sql);
    console.log('参数:', params);
    
    // 执行插入
    const [result] = await connection.execute(sql, params);
    console.log('支付记录插入成功:', result);
    
    return result;
  } catch (error) {
    console.error('支付记录插入失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 直接执行查询，用于调试
export async function debugQuery(sql: string) {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log(`执行调试查询: ${sql}`);
    
    const [results] = await connection.execute(sql);
    console.log('调试查询结果:', results);
    
    return results;
  } catch (error) {
    console.error('调试查询失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export default {
  query,
  testConnection,
  insertPayment,
  debugQuery
}; 