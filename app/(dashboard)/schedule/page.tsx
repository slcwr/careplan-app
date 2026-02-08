// スケジュール管理ページ
'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import ScheduleCalendar from '@/app/components/schedule/ScheduleCalendar'
import ScheduleFormDialog from '@/app/components/schedule/ScheduleFormDialog'

export default function SchedulePage() {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedDate(slotInfo.start)
    setOpenDialog(true)
  }

  const handleSaved = () => {
    // カレンダーをリフレッシュ
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          スケジュール
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedDate(new Date())
            setOpenDialog(true)
          }}
        >
          予定を追加
        </Button>
      </Box>

      <ScheduleCalendar
        onSelectSlot={handleSelectSlot}
        refreshTrigger={refreshTrigger}
      />

      <ScheduleFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSaved={handleSaved}
        defaultDate={selectedDate}
      />
    </Box>
  )
}
