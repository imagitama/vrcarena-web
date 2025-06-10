import React, { Fragment } from 'react'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

// TODO: Re-use
interface Option {
  value: string
  label: string
}

export default ({
  onChange,
  value = null,
  options,
}: {
  value: string | null
  onChange: (newVal: string | null) => void
  options: Option[]
}) => (
  <>
    {options.map(({ value: optionValue, label }) => {
      const isChecked = value === optionValue
      return (
        <Fragment key={optionValue}>
          <FormControlLabel
            label={label}
            control={
              <Checkbox
                onChange={() => onChange(optionValue)}
                checked={isChecked}
              />
            }
          />
        </Fragment>
      )
    })}
  </>
)
