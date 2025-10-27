// 利用者一覧コンポーネント
'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Link from 'next/link'
import { Client } from '@/app/lib/types'
import { createClient as createSupabaseClient } from '@/app/lib/supabase/client'

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const supabase = createSupabaseClient()

      // 認証されたユーザーを取得
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('ログインが必要です')
        setLoading(false)
        return
      }

      // user_idでフィルタリングして利用者を取得
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      setError('利用者の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, client: Client) => {
    setAnchorEl(event.currentTarget)
    setSelectedClient(client)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedClient(null)
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'default'
      case 'suspended':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '利用中'
      case 'inactive':
        return '利用終了'
      case 'suspended':
        return '一時停止'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )
  }

  if (clients.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          利用者が登録されていません。「新規登録」ボタンから利用者を追加してください。
        </Typography>
      </Paper>
    )
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>氏名</TableCell>
              <TableCell>年齢</TableCell>
              <TableCell>要介護度</TableCell>
              <TableCell>電話番号</TableCell>
              <TableCell>認定有効期限</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} hover>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {client.name}
                  </Typography>
                  {client.name_kana && (
                    <Typography variant="caption" color="text.secondary">
                      {client.name_kana}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{calculateAge(client.birth_date)}歳</TableCell>
                <TableCell>
                  {client.care_level && (
                    <Chip label={client.care_level} size="small" />
                  )}
                </TableCell>
                <TableCell>{client.phone || '-'}</TableCell>
                <TableCell>
                  {client.certification_valid_to
                    ? new Date(client.certification_valid_to).toLocaleDateString('ja-JP')
                    : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(client.status)}
                    color={getStatusColor(client.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, client)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          component={Link}
          href={`/reports/new?clientId=${selectedClient?.id}`}
          onClick={handleMenuClose}
        >
          ケアプラン作成
        </MenuItem>
        <MenuItem
          component={Link}
          href={`/schedule?clientId=${selectedClient?.id}`}
          onClick={handleMenuClose}
        >
          スケジュール登録
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          利用者情報を編集
        </MenuItem>
      </Menu>
    </>
  )
}
