import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // 获取所有支付记录
    const payments = await query(
      'SELECT * FROM payments ORDER BY payment_date DESC'
    );
    
    return NextResponse.json({ 
      success: true, 
      data: payments 
    });
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