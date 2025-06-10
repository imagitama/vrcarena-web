import React from 'react'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  root: {
    fontSize: '1.5rem',
  },
  fullWidth: {
    width: '100%',
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
  onChange?: (newVal: boolean) => void | Promise<void>
  label?: string
  value: boolean
  isDisabled?: boolean
  fullWidth?: boolean
  onClick?: () => void
}) => {
  const classes = useStyles()
  return (
    <FormControlLabel
      label={label}
      className={`${classes.root} ${fullWidth ? classes.fullWidth : ''}`}
      control={
        <Checkbox
          onChange={onChange ? () => onChange(!value) : undefined}
          checked={value}
          disabled={isDisabled}
          size="large"
        />
      }
      onClick={onClick}
    />
  )
}

export default CheckboxInput
