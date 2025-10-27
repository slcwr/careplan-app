// Dashboard共通レイアウト

'use client'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import MicIcon from '@mui/icons-material/Mic'
import DescriptionIcon from '@mui/icons-material/Description'
import PeopleIcon from '@mui/icons-material/People'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import LogoutIcon from '@mui/icons-material/Logout'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            component="a"
            href="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 'bold',
            }}
          >
            居宅サービス計画書作成支援システム
          </Typography>
          <Button
            href="/clients"
            startIcon={<PeopleIcon />}
            color={pathname?.startsWith('/clients') ? 'primary' : 'inherit'}
            sx={{ mx: 1 }}
          >
            利用者
          </Button>
          <Button
            href="/schedule"
            startIcon={<CalendarMonthIcon />}
            color={pathname?.startsWith('/schedule') ? 'primary' : 'inherit'}
            sx={{ mx: 1 }}
          >
            スケジュール
          </Button>
          <Button
            href="/record"
            startIcon={<MicIcon />}
            color={pathname === '/record' ? 'primary' : 'inherit'}
            sx={{ mx: 1 }}
          >
            録音
          </Button>
          <Button
            href="/reports"
            startIcon={<DescriptionIcon />}
            color={pathname?.startsWith('/reports') ? 'primary' : 'inherit'}
            sx={{ mx: 1 }}
          >
            レポート
          </Button>
          <IconButton
            onClick={handleLogout}
            color="inherit"
            sx={{ ml: 2 }}
            title="ログアウト"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  )
}
