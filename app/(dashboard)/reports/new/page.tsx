// 新規レポート作成ページ

'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

export default function ReportNewPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 4 }}>
        新規計画書作成
      </Typography>
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            新規作成フォームがここに表示されます
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
