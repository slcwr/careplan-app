// 新規レポート作成ページ

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import ReportForm from '@/app/components/reports/ReportForm'
import { CarePlanReport } from '@/app/lib/types'
import { createClient } from '@/app/lib/supabase/client'

export default function ReportNewPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('ログインが必要です')
        setLoading(false)
        return
      }

      setUserId(user.id)
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleSubmit = async (data: Partial<CarePlanReport>) => {
    if (!userId) {
      setError('ユーザー情報が取得できません')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          user_id: userId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // 作成されたレポートの詳細ページに遷移
        router.push(`/reports/${result.data.id}`)
      } else {
        setError('レポートの作成に失敗しました')
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          新規計画書作成
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          href="/reports"
        >
          一覧に戻る
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <ReportForm
        onSubmit={handleSubmit}
        submitLabel={submitting ? '作成中...' : '作成'}
        disabled={submitting || !userId}
      />
    </Box>
  )
}
