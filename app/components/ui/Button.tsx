// 共通ボタンコンポーネント（MUI版）

'use client'

import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button'

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export default function Button({
  variant = 'primary',
  children,
  ...props
}: ButtonProps) {
  const variantMap = {
    primary: 'contained' as const,
    secondary: 'outlined' as const,
    danger: 'contained' as const,
  }

  const colorMap = {
    primary: 'primary' as const,
    secondary: 'secondary' as const,
    danger: 'error' as const,
  }

  return (
    <MuiButton
      variant={variantMap[variant]}
      color={colorMap[variant]}
      {...props}
    >
      {children}
    </MuiButton>
  )
}
