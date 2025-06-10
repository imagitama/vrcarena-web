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
  value = [],
  options,
}: {
  value: string[]
  onChange: (newOpts: string[]) => void
  options: Option[]
}) => (
  <>
    {options.map(({ value: optionValue, label }) => {
      const isChecked = value.includes(optionValue)
      return (
        <Fragment key={optionValue}>
          <FormControlLabel
            label={label}
            control={
              <Checkbox
                onChange={() => {
                  const newIsChecked = !isChecked
                  if (newIsChecked) {
                    onChange(value.concat([optionValue]))
                  } else {
                    onChange(value.filter((val) => val !== optionValue))
                  }
                }}
                checked={isChecked}
              />
            }
          />
        </Fragment>
      )
    })}
  </>
)
