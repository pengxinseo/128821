import { NextResponse } from 'next/server';
import { query, testConnection } from '@/lib/db';

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
    
    // 获取所有支付记录 - 修改为查询 iuu_payment 表
    try {
      const payments = await query(
        'SELECT * FROM iuu_payment ORDER BY payment_date DESC'
      );
      
      console.log(`成功获取到 ${Array.isArray(payments) ? payments.length : 0} 条支付记录`);
      console.log('支付记录示例:', Array.isArray(payments) && payments.length > 0 ? payments[0] : '无记录');
      
      return NextResponse.json({ 
        success: true, 
        data: payments 
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