// ダッシュボード - 文字起こし一覧

'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 4 }}>
        ダッシュボード
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            最近の文字起こし
          </Typography>
          <Typography color="text.secondary">
            文字起こし履歴がここに表示されます
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
