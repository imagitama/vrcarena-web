import React, { Fragment } from 'react'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { SelectEditableField } from '@/editable-fields'

export default ({
  editableField,
  onChange,
  value = [],
}: {
  editableField: SelectEditableField<any>
  value: string[]
  onChange: (newOpts: string[]) => void
}) => (
  <>
    {editableField.options.map(({ value: optionValue, label }) => {
      if (optionValue === null) {
        return null
      }

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
