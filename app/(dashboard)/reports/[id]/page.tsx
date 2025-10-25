// 個別レポート表示ページ

'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ReportViewer from '@/app/components/reports/ReportViewer'
import { CarePlanReport } from '@/app/lib/types'

export default function ReportDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [report, setReport] = useState<CarePlanReport | null>(null)
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          href="/reports"
        >
          一覧に戻る
        </Button>
      </Box>
    )
  }

  if (!report) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 4 }}>
          レポートが見つかりません
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          href="/reports"
        >
          一覧に戻る
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          居宅サービス計画書
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            href={`/reports/${params.id}/edit`}
          >
            編集
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            href="/reports"
          >
            一覧に戻る
          </Button>
        </Box>
      </Box>

      <ReportViewer report={report as CarePlanReport} />
    </Box>
  )
}
