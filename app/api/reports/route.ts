// レポートAPI - 一覧取得・作成

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase'

// GET /api/reports - レポート一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let query = supabaseAdmin.from('care_plan_reports').select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Get reports error:', error)
    return Response.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

// POST /api/reports - レポート作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('care_plan_reports')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Create report error:', error)
    return Response.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
}
