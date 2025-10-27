// 利用者管理ページ
'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import ClientList from '@/app/components/clients/ClientList'
import ClientFormDialog from '@/app/components/clients/ClientFormDialog'

export default function ClientsPage() {
  const [openDialog, setOpenDialog] = useState(false)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          利用者管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          新規登録
        </Button>
      </Box>

      <ClientList />

      <ClientFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />
    </Box>
  )
}
