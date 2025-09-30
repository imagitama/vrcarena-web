import React, { Fragment } from 'react'
import CheckboxInput from '../../../checkbox-input'
import { Option, SelectEditableField } from '../../../../editable-fields'

export default ({
  editableField,
  onChange,
  value = null,
}: {
  editableField: SelectEditableField<any>
  value: string | null
  onChange: (newVal: string | null) => void
}) => (
  <>
    {editableField.options.map(({ value: optionValue, label }) => {
      const isChecked = value === optionValue
      return (
        <CheckboxInput
          key={optionValue}
          label={label}
          onChange={() => onChange(optionValue)}
          value={isChecked}
        />
      )
    })}
  </>
)
