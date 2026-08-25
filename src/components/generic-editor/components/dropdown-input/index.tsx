import React from 'react'
import MenuItem from '@mui/material/MenuItem'
import { SelectProps } from '@mui/material/Select'

import { SelectEditableField } from '@/editable-fields'
import Select from '@/components/select'

const DropdownInput = ({
  editableField,
  onChange,
  value = null,
  selectProps = {},
  formFields,
}: {
  editableField: SelectEditableField<any>
  onChange: (newVal: any) => void
  value: string | null
  selectProps?: SelectProps
  formFields: any
}) => {
  const options = Array.isArray(editableField.options)
    ? editableField.options
    : editableField.options(formFields)

  return (
    <Select
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      {...selectProps}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value || undefined}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  )
}

export default DropdownInput
