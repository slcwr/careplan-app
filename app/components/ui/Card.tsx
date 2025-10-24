// 共通カードコンポーネント（MUI版）

import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <MuiCard className={className} elevation={1}>
      <CardContent>{children}</CardContent>
    </MuiCard>
  )
}
