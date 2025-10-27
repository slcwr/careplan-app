// スケジュール登録・編集ダイアログ
'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from '@mui/material'
import { Schedule, Client } from '@/app/lib/types'
import { createClient as createSupabaseClient } from '@/app/lib/supabase/client'
import { format } from 'date-fns'

interface ScheduleFormDialogProps {
  open: boolean
  onClose: () => void
  schedule?: Schedule
  defaultDate?: Date
}

const eventTypes = [
  { value: 'visit', label: '訪問' },
  { value: 'monitoring', label: 'モニタリング' },
  { value: 'meeting', label: 'サービス担当者会議' },
  { value: 'assessment', label: 'アセスメント' },
  { value: 'other', label: 'その他' },
]

const priorities = [
  { value: 'high', label: '高' },
  { value: 'normal', label: '通常' },
  { value: 'low', label: '低' },
]

export default function ScheduleFormDialog({
  open,
  onClose,
  schedule,
  defaultDate,
}: ScheduleFormDialogProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    title: schedule?.title || '',
    description: schedule?.description || '',
    event_type: schedule?.event_type || 'visit',
    start_time: schedule?.start_time || (defaultDate ? format(defaultDate, "yyyy-MM-dd'T'HH:mm") : ''),
    end_time: schedule?.end_time || '',
    all_day: schedule?.all_day || false,
    location: schedule?.location || '',
    priority: schedule?.priority || 'normal',
    reminder_enabled: schedule?.reminder_enabled ?? true,
    reminder_time: schedule?.reminder_time || 24,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClients()
    if (schedule?.client_id) {
      fetchClientById(schedule.client_id)
    }
  }, [schedule])

  const fetchClients = async () => {
    try {
      const supabase = createSupabaseClient()

      // 認証されたユーザーを取得
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchClientById = async (clientId: string) => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (error) throw error
      setSelectedClient(data)
    } catch (error) {
      console.error('Error fetching client:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
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

      const scheduleData = {
        ...formData,
        user_id: user.id,
        client_id: selectedClient?.id || null,
        status: 'scheduled',
        reminder_sent: false,
      }

      if (schedule?.id) {
        // 更新
        const { error } = await supabase
          .from('schedules')
          .update(scheduleData)
          .eq('id', schedule.id)

        if (error) throw error
      } else {
        // 新規登録
        const { error } = await supabase
          .from('schedules')
          .insert([scheduleData])

        if (error) throw error
      }

      alert(schedule ? 'スケジュールを更新しました' : 'スケジュールを登録しました')
      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {schedule ? 'スケジュールの編集' : '新規スケジュール登録'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="タイトル"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  value={selectedClient}
                  onChange={(_, newValue) => setSelectedClient(newValue)}
                  options={clients}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField {...params} label="利用者" />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.care_level}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="event_type"
                  label="種類"
                  value={formData.event_type}
                  onChange={handleChange}
                  fullWidth
                  required
                  select
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="priority"
                  label="優先度"
                  value={formData.priority}
                  onChange={handleChange}
                  fullWidth
                  select
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="start_time"
                  label="開始日時"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="end_time"
                  label="終了日時"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="all_day"
                      checked={formData.all_day}
                      onChange={handleChange}
                    />
                  }
                  label="終日"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="location"
                  label="場所"
                  value={formData.location}
                  onChange={handleChange}
                  fullWidth
                  placeholder="例: 利用者宅、事業所"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="メモ"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  リマインダー設定
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="reminder_enabled"
                      checked={formData.reminder_enabled}
                      onChange={handleChange}
                    />
                  }
                  label="リマインダーを有効にする"
                />
                {formData.reminder_enabled && (
                  <TextField
                    name="reminder_time"
                    label="何時間前に通知"
                    type="number"
                    value={formData.reminder_time}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            キャンセル
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? '保存中...' : schedule ? '更新' : '登録'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
