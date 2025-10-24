// 個別レポート表示ページ

'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ReportViewer from '@/app/components/reports/ReportViewer'
import { mockCarePlanReports } from '@/app/lib/mockData'
import { CarePlanReport } from '@/app/lib/types'

export default function ReportDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // IDに基づいてモックデータから該当レポートを取得
  const report = mockCarePlanReports.find(r => r.id === params.id)

  // レポートが見つからない場合
  if (!report) {
    return (
      <Box>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 4 }}>
          レポートが見つかりません
        </Typography>
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
