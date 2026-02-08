// レポートAPI - 個別操作

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase'

// GET /api/reports/[id] - レポート詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('care_plan_reports')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Get report error:', error)
    return Response.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
}

// PUT /api/reports/[id] - レポート更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('care_plan_reports')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Update report error:', error)
    return Response.json(
      { error: 'Failed to update report' },
      { status: 500 }
    )
  }
}

// DELETE /api/reports/[id] - レポート削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin
      .from('care_plan_reports')
      .delete()
      .eq('id', id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete report error:', error)
    return Response.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    )
  }
}
