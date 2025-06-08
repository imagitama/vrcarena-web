import React, { Fragment } from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

// TODO: Re-use
interface Option {
  value: string
  label: string
}

export default ({ onChange, value = [], options }: {
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
                    onChange(value.filter(val => val !== optionValue))
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
