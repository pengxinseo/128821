import { NextResponse } from 'next/server';
import { query, testConnection, debugQuery } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // 首先测试数据库连接
    console.log('正在测试数据库连接...');
    const connected = await testConnection();
    if (!connected) {
      console.error('无法连接到数据库!');
      return NextResponse.json({ 
        success: false, 
        error: '无法连接到数据库' 
      }, { status: 500 });
    }
    
    console.log('数据库连接成功，正在查询支付记录...');
    
    // 获取所有支付记录
    try {
      // 先尝试调试查询，看看数据库是否可用
      await debugQuery('SHOW TABLES');
      
      // 直接查询支付表
      console.log('直接查询 iuu_payment 表...');
      let payments = await query('SELECT * FROM iuu_payment', []);
      
      console.log(`查询结果: ${Array.isArray(payments) ? payments.length : 0} 条记录`);
      
      // 如果没有结果，尝试一次最简单的查询
      if (Array.isArray(payments) && payments.length === 0) {
        console.log('尝试简单查询: SELECT * FROM iuu_payment LIMIT 10');
        payments = await query('SELECT * FROM iuu_payment LIMIT 10', []);
      }
      
      // 记录详细的查询结果
      if (Array.isArray(payments)) {
        console.log(`查询返回 ${payments.length} 条记录`);
        if (payments.length > 0) {
          console.log('第一条记录:', JSON.stringify(payments[0]));
        }
      } else {
        console.log('查询返回非数组结果:', payments);
      }
      
      return NextResponse.json({ 
        success: true, 
        data: payments || []
      });
    } catch (queryError) {
      console.error('SQL查询失败:', queryError);
      return NextResponse.json({ 
        success: false, 
        error: '查询支付记录失败', 
        details: String(queryError) 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('获取支付记录时出错:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取支付记录失败', 
        details: String(error) 
      },
      { status: 500 }
    );
  }
} 