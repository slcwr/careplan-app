// レポート編集ページ

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import ReportForm from '@/app/components/reports/ReportForm'
import { CarePlanReport } from '@/app/lib/types'

export default function ReportEditPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [report, setReport] = useState<CarePlanReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(`/api/reports/${params.id}`)
        const data = await response.json()

        if (data.success) {
          setReport(data.data)
        } else {
          setError('レポートの取得に失敗しました')
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [params.id])

  const handleSubmit = async (data: Partial<CarePlanReport>) => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/reports/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        // 成功したら詳細ページに遷移
        router.push(`/reports/${params.id}`)
      } else {
        setError('更新に失敗しました')
      }
    } catch (err) {
      console.error('Update error:', err)
      setError('エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && !report) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  if (!report) {
    return (
      <Box>
        <Alert severity="warning">
          レポートが見つかりません
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 4 }}>
        計画書を編集
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <ReportForm
        initialData={report}
        onSubmit={handleSubmit}
        isLoading={saving}
      />
    </Box>
  )
}
