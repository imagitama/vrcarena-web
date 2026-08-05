import React from 'react'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  root: {},
  fullWidth: {
    width: '100%',
  },
  checkbox: {
    '&&': {
      fontSize: '1.5rem',
      padding: '0.25rem',
    },
  },
})

const CheckboxInput = ({
  onChange,
  label,
  value,
  isDisabled = false,
  fullWidth = false,
  onClick,
}: {
  onChange?: (
    newVal: boolean,
    event: React.SyntheticEvent
  ) => void | Promise<void>
  label?: string | React.ReactElement
  value: boolean
  isDisabled?: boolean
  fullWidth?: boolean
  onClick?: (e: React.MouseEvent<HTMLLabelElement, MouseEvent>) => void
}) => {
  const classes = useStyles()
  return (
    <FormControlLabel
      label={label}
      className={`${classes.root} ${fullWidth ? classes.fullWidth : ''}`}
      control={
        <Checkbox
          onChange={onChange ? (e) => onChange(!value, e) : undefined}
          checked={value}
          disabled={isDisabled}
          size="large"
          className={classes.checkbox}
        />
      }
      onClick={onClick}
    />
  )
}

export default CheckboxInput
