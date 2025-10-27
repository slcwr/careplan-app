// カレンダーコンポーネント
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Paper, Box, CircularProgress } from '@mui/material'
import { Schedule } from '@/app/lib/types'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const locales = {
  'ja': ja,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// カレンダーイベント型
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Schedule
}

interface ScheduleCalendarProps {
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
  onSelectEvent?: (event: CalendarEvent) => void
}

export default function ScheduleCalendar({ onSelectSlot, onSelectEvent }: ScheduleCalendarProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          client:clients(*)
        `)
        .order('start_time', { ascending: true })

      if (error) throw error
      setSchedules(data || [])
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  // スケジュールをカレンダーイベントに変換
  const events: CalendarEvent[] = useMemo(() => {
    return schedules.map((schedule) => ({
      id: schedule.id,
      title: schedule.title,
      start: new Date(schedule.start_time),
      end: new Date(schedule.end_time),
      resource: schedule,
    }))
  }, [schedules])

  // イベントのスタイル
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const schedule = event.resource
    let backgroundColor = '#3174ad'

    switch (schedule.event_type) {
      case 'visit':
        backgroundColor = '#2196f3' // 青
        break
      case 'monitoring':
        backgroundColor = '#f57c00' // オレンジ
        break
      case 'meeting':
        backgroundColor = '#7b1fa2' // 紫
        break
      case 'assessment':
        backgroundColor = '#388e3c' // 緑
        break
      default:
        backgroundColor = '#757575' // グレー
    }

    if (schedule.priority === 'high') {
      backgroundColor = '#d32f2f' // 赤
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: schedule.status === 'completed' ? 0.6 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    }
  }, [])

  // 日本語メッセージ
  const messages = {
    allDay: '終日',
    previous: '前',
    next: '次',
    today: '今日',
    month: '月',
    week: '週',
    day: '日',
    agenda: '予定',
    date: '日付',
    time: '時刻',
    event: 'イベント',
    noEventsInRange: 'この期間にイベントはありません',
    showMore: (total: number) => `+${total} 件`,
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={messages}
          culture="ja"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          selectable
          onSelectSlot={onSelectSlot}
          onSelectEvent={onSelectEvent}
          eventPropGetter={eventStyleGetter}
          popup
        />
      </Box>

      {/* 凡例 */}
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#2196f3', borderRadius: 1 }} />
          <span>訪問</span>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#f57c00', borderRadius: 1 }} />
          <span>モニタリング</span>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#7b1fa2', borderRadius: 1 }} />
          <span>会議</span>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#388e3c', borderRadius: 1 }} />
          <span>アセスメント</span>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#d32f2f', borderRadius: 1 }} />
          <span>優先度: 高</span>
        </Box>
      </Box>
    </Paper>
  )
}
