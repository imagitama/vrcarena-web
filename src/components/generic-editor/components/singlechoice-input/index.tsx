import React from 'react'
import CheckboxInput from '@/components/checkbox-input'
import { SelectEditableField } from '@/editable-fields'

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
    {(editableField.options || []).map(({ value: optionValue, label }) => {
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
