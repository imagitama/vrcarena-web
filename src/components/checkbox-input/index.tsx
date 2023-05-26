import React from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

export default ({
  onChange,
  label,
  value,
  isDisabled = false
}: {
  onChange: (newVal: boolean) => void | Promise<void>
  label: string
  value: boolean
  isDisabled?: boolean
}) => (
  <FormControlLabel
    label={label}
    control={
      <Checkbox
        onChange={() => onChange(!value)}
        checked={value}
        disabled={isDisabled}
      />
    }
  />
)
