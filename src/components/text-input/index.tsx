import React from 'react'
import { makeStyles } from '@mui/styles'
import FormControl from '@mui/material/FormControl'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import classNames from 'classnames'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  textField: {},
  input: {},
  button: {
    height: '40px !important', // to match 100%
  },
  small: {
    height: '24px',
    '& $textField': {
      height: '100%',
    },
    '& $input': {
      height: '100%',
      '& > *': {
        paddingLeft: '8px',
        paddingRight: '8px',
        fontSize: '75%',
      },
    },
  },
  large: {
    height: '40px',
    '&&': {
      paddingLeft: '12px',
      paddingRight: '12px',
    },
  },
  withButton: {
    '& $input': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    '& $button': {
      borderLeft: 'none',
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  },
  topMargin: {
    marginTop: '0.5rem',
  },
  inputGroup: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export type Props = Omit<TextFieldProps, 'size'> & {
  label?: string
  isDisabled?: boolean
  variant?: 'outlined'
  button?: React.ReactElement
  size?: 'small' | 'medium'
  topMargin?: boolean
}

const TextInput = ({ id, button, label, topMargin, ...props }: Props) => {
  const classes = useStyles()
  return (
    <FormControl
      className={classNames({
        [classes.root]: true,
        [classes.withButton]: button !== undefined,
        [classes.topMargin]: topMargin !== undefined,
      })}
      variant="outlined"
      fullWidth={props.fullWidth}
      size="small">
      <div className={classes.inputGroup}>
        <TextField
          id={id}
          label={label}
          multiline={props.minRows !== undefined}
          disabled={props.isDisabled}
          size="small"
          InputProps={{
            classes: {
              root: classes.input,
            },
          }}
          {...props}
        />
        {button
          ? React.cloneElement(button, { className: classes.button })
          : null}
      </div>
    </FormControl>
  )
}

export default TextInput
