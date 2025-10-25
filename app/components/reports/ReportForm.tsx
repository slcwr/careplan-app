// レポート入力フォーム（MUI版）

'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import { CarePlanReport } from '@/app/lib/types'

interface ReportFormProps {
  initialData?: Partial<CarePlanReport>
  onSubmit: (data: Partial<CarePlanReport>) => void
  isLoading?: boolean
}

export default function ReportForm({ initialData, onSubmit, isLoading }: ReportFormProps) {
  const [formData, setFormData] = useState({
    client_name: initialData?.client_name ?? '',
    client_age: initialData?.client_age?.toString() ?? '',
    care_level: initialData?.care_level ?? '',
    life_issues: initialData?.life_issues ?? '',
    long_term_goal: initialData?.long_term_goal ?? '',
    remarks: initialData?.remarks ?? '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 文字列から適切な型に変換
    const submitData: Partial<CarePlanReport> = {
      client_name: formData.client_name,
      client_age: formData.client_age ? parseInt(formData.client_age, 10) : null,
      care_level: formData.care_level || null,
      life_issues: formData.life_issues || null,
      long_term_goal: formData.long_term_goal || null,
      remarks: formData.remarks || null,
    }

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* 基本情報 */}
          <Typography variant="h6" gutterBottom color="primary">
            基本情報
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
            <TextField
              label="氏名"
              required
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="年齢"
              type="number"
              value={formData.client_age}
              onChange={(e) => setFormData({ ...formData, client_age: e.target.value })}
              fullWidth
            />
            <TextField
              label="要介護度"
              select
              value={formData.care_level}
              onChange={(e) => setFormData({ ...formData, care_level: e.target.value })}
              fullWidth
            >
              <MenuItem value="">選択してください</MenuItem>
              <MenuItem value="要支援1">要支援1</MenuItem>
              <MenuItem value="要支援2">要支援2</MenuItem>
              <MenuItem value="要介護1">要介護1</MenuItem>
              <MenuItem value="要介護2">要介護2</MenuItem>
              <MenuItem value="要介護3">要介護3</MenuItem>
              <MenuItem value="要介護4">要介護4</MenuItem>
              <MenuItem value="要介護5">要介護5</MenuItem>
            </TextField>
          </Box>

          {/* 生活課題・目標 */}
          <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4 }}>
            生活課題・目標
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
            <TextField
              label="生活課題"
              multiline
              rows={3}
              value={formData.life_issues}
              onChange={(e) => setFormData({ ...formData, life_issues: e.target.value })}
              fullWidth
            />
            <TextField
              label="長期目標"
              multiline
              rows={2}
              value={formData.long_term_goal}
              onChange={(e) => setFormData({ ...formData, long_term_goal: e.target.value })}
              fullWidth
            />
          </Box>

          {/* 備考 */}
          <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4 }}>
            備考
          </Typography>
          <TextField
            multiline
            rows={3}
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            fullWidth
          />
        </CardContent>
      </Card>

      {/* 送信ボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          href="/reports"
          disabled={isLoading}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={isLoading}
        >
          {isLoading ? '保存中...' : '保存'}
        </Button>
      </Box>
    </form>
  )
}
