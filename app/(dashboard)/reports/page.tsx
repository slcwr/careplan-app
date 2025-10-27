// レポート一覧ページ

'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { CarePlanReport } from '@/app/lib/types'
import { createClient } from '@/app/lib/supabase/client'

export default function ReportsPage() {
  const [reports, setReports] = useState<CarePlanReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReports() {
      try {
        const supabase = createClient()

        // 認証されたユーザーを取得
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError('ログインが必要です')
          setLoading(false)
          return
        }

        const response = await fetch(`/api/reports?userId=${user.id}`)
        const data = await response.json()

        if (data.success) {
          setReports(data.data || [])
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

    fetchReports()
  }, [])

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
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          居宅サービス計画書
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          href="/reports/new"
        >
          新規作成
        </Button>
      </Box>

      {reports.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              レポートがありません。新規作成してください。
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {reports.map((report) => {
            // client情報を取得（リレーションデータまたはclient_idから取得）
            const clientName = report.client?.name || '利用者情報なし'
            const clientAge = report.client?.birth_date
              ? new Date().getFullYear() - new Date(report.client.birth_date).getFullYear()
              : null
            const careLevel = report.client?.care_level || '未設定'

            return (
              <Card key={report.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {clientName}
                    </Typography>
                    <Chip
                      label={careLevel}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  {clientAge && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {clientAge}歳
                    </Typography>
                  )}
                  {report.long_term_goal && (
                    <Typography variant="body2" sx={{ mt: 2 }} noWrap>
                      目標: {report.long_term_goal}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      サービス数: {report.services?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(report.created_at).toLocaleDateString('ja-JP')}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    href={`/reports/${report.id}`}
                    fullWidth
                  >
                    詳細を見る
                  </Button>
                </CardActions>
              </Card>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
