// 利用者登録・編集ダイアログ
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Grid,
} from '@mui/material'
import { Client } from '@/app/lib/types'
import { createClient as createSupabaseClient } from '@/app/lib/supabase/client'

interface ClientFormDialogProps {
  open: boolean
  onClose: () => void
  client?: Client
}

const careLevels = [
  '要支援1',
  '要支援2',
  '要介護1',
  '要介護2',
  '要介護3',
  '要介護4',
  '要介護5',
]

export default function ClientFormDialog({ open, onClose, client }: ClientFormDialogProps) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    name_kana: client?.name_kana || '',
    birth_date: client?.birth_date || '',
    gender: client?.gender || '',
    address: client?.address || '',
    phone: client?.phone || '',
    email: client?.email || '',
    care_level: client?.care_level || '',
    insurance_number: client?.insurance_number || '',
    certification_date: client?.certification_date || '',
    certification_valid_from: client?.certification_valid_from || '',
    certification_valid_to: client?.certification_valid_to || '',
    notes: client?.notes || '',
  })

  const [saving, setSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('ログインしてください')
        return
      }

      const clientData = {
        ...formData,
        user_id: user.id,
        status: 'active',
      }

      if (client?.id) {
        // 更新
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id)

        if (error) throw error
      } else {
        // 新規登録
        const { error } = await supabase
          .from('clients')
          .insert([clientData])

        if (error) throw error
      }

      alert(client ? '利用者情報を更新しました' : '利用者を登録しました')
      onClose()
      window.location.reload() // リロードして一覧を更新
    } catch (error) {
      console.error('Error saving client:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {client ? '利用者情報の編集' : '利用者の新規登録'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom color="primary">
              基本情報
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="氏名"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name_kana"
                  label="フリガナ"
                  value={formData.name_kana}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="birth_date"
                  label="生年月日"
                  type="date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="gender"
                  label="性別"
                  value={formData.gender}
                  onChange={handleChange}
                  fullWidth
                  select
                >
                  <MenuItem value="男性">男性</MenuItem>
                  <MenuItem value="女性">女性</MenuItem>
                  <MenuItem value="その他">その他</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mt: 3 }}>
              連絡先
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="住所"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="phone"
                  label="電話番号"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="メールアドレス"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mt: 3 }}>
              介護保険情報
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="care_level"
                  label="要介護度"
                  value={formData.care_level}
                  onChange={handleChange}
                  fullWidth
                  select
                >
                  {careLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="insurance_number"
                  label="被保険者番号"
                  value={formData.insurance_number}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="certification_date"
                  label="認定日"
                  type="date"
                  value={formData.certification_date}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="certification_valid_from"
                  label="認定有効期間（開始）"
                  type="date"
                  value={formData.certification_valid_from}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="certification_valid_to"
                  label="認定有効期間（終了）"
                  type="date"
                  value={formData.certification_valid_to}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mt: 3 }}>
              備考
            </Typography>
            <TextField
              name="notes"
              label="備考"
              value={formData.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            キャンセル
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? '保存中...' : client ? '更新' : '登録'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
