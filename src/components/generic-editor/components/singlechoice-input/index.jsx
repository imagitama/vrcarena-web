import React, { Fragment } from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

export default ({ onChange, value = null, options }) => (
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
