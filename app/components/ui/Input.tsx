// 共通インプットコンポーネント（MUI版）

import TextField, { TextFieldProps } from '@mui/material/TextField'

interface InputProps extends Omit<TextFieldProps, 'variant' | 'error'> {
  errorMessage?: string
}

export default function Input({ errorMessage, helperText, ...props }: InputProps) {
  return (
    <TextField
      variant="outlined"
      fullWidth
      error={!!errorMessage}
      helperText={errorMessage || helperText}
      {...props}
    />
  )
}
