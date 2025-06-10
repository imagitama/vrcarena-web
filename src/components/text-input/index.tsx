import React from 'react'
import { makeStyles } from '@mui/styles'
import TextField, { TextFieldProps } from '@mui/material/TextField'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  button: {
    height: '100%',
    margin: '0 0.25rem',
  },
})

type Props = TextFieldProps & {
  isDisabled?: boolean
  variant?: 'outlined'
  button?: React.ReactElement
}

const TextInput = ({ button, ...props }: Props) => {
  const classes = useStyles()

  return (
    <span
      className={`${classes.root} ${props.fullWidth ? classes.fullWidth : ''}`}>
      <TextField
        {...props}
        multiline={props.minRows !== undefined}
        variant={props.variant || 'outlined'}
        disabled={props.isDisabled}
      />
      {button
        ? React.cloneElement(button, { className: classes.button })
        : null}
    </span>
  )
}

export default TextInput
