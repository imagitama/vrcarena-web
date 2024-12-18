import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    <span className={classes.root}>
      <TextField
        {...props}
        multiline={'rows' in props}
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
