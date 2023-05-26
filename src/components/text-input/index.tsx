import React from 'react'
import TextField from '@material-ui/core/TextField'

export default (props: {
  // standard props
  fullWidth?: boolean
  label?: string
  helperText?: string
  value?: string | number
  className?: string
  multiline?: boolean
  rows?: number
  onChange?: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void
  placeholder?: string
  size?: string
  // custom
  isDisabled?: boolean
  variant?: 'outlined' | 'standard'
}) => (
  // @ts-ignore
  <TextField
    {...props}
    // @ts-ignore
    variant={props.variant || 'outlined'}
    disabled={props.isDisabled}
  />
)
