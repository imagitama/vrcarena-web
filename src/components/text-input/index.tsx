import React from 'react'
import { makeStyles } from '@mui/styles'
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
  button: {
    // height: '100%',
    // marginLeft: '0.5rem !important',
  },
  textField: {},
  input: {},
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
    '&&': {
      // paddingLeft: '8px',
      // paddingRight: '8px',
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
      borderLeft: 'none', // TODO: fix sometime
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  },
})

export type Props = Omit<TextFieldProps, 'size'> & {
  isDisabled?: boolean
  variant?: 'outlined'
  button?: React.ReactElement
  size?: 'small' | 'large'
}

const TextInput = ({ button, ...props }: Props) => {
  const classes = useStyles()
  return (
    <span
      className={classNames({
        [classes.root]: true,
        [classes.fullWidth]: props.fullWidth,
        [classes.small]: props.size === 'small' && props.minRows === undefined,
        [classes.large]: props.size === 'large' && props.minRows === undefined,
        [classes.withButton]: button !== undefined,
      })}>
      <TextField
        multiline={props.minRows !== undefined}
        variant={'outlined'}
        disabled={props.isDisabled}
        size={props.size as any}
        classes={{
          root: classes.textField,
        }}
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
    </span>
  )
}

export default TextInput
