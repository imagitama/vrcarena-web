import React, { Fragment } from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

// TODO: Re-use
interface Option {
  value: string
  label: string
}

export default ({ onChange, value = null, options }: {
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
