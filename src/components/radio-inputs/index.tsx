import React from 'react'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'

export interface RadioOption {
  value: string
  label: string
}

const RadioInputs = ({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (newValue: string) => void
  options: RadioOption[]
}) => {
  return (
    <RadioGroup value={value} row onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={<Radio />}
          label={option.label}
        />
      ))}
    </RadioGroup>
  )
}

export default RadioInputs
