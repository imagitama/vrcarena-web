import React, { Fragment } from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

export default ({ onChange, value = [], options }) => (
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
