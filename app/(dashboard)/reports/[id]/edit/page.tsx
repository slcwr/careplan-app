// レポート編集ページ

'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

export default function ReportEditPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 4 }}>
        計画書を編集
      </Typography>
      <Card>
        <CardContent>
          <Typography color="text.secondary" gutterBottom>
            レポートID: {params.id}
          </Typography>
          <Typography color="text.secondary">
            編集フォームがここに表示されます
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
