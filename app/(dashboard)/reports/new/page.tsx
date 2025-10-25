// 新規レポート作成ページ

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Alert from '@mui/material/Alert'
import ReportForm from '@/app/components/reports/ReportForm'
import { CarePlanReport } from '@/app/lib/types'

export default function ReportNewPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data: Partial<CarePlanReport>) => {
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
          user_id: 'user-123', // TODO: 実際のユーザーIDに置き換える
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
        disabled={submitting}
      />
    </Box>
  )
}
