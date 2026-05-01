import React from 'react'
import MenuItem from '@mui/material/MenuItem'
import { SelectProps } from '@mui/material/Select'

import { EditableField, SelectEditableField } from '@/editable-fields'
import Select from '@/components/select'

const DropdownInput = ({
  editableField,
  onChange,
  value = null,
  selectProps = {},
}: {
  editableField: EditableField<any, any>
  onChange: (newVal: any) => void
  value: string | null
  selectProps?: SelectProps
}) => (
  <Select
    value={value}
    onChange={(e: any) => onChange(e.target.value)}
    // disabled={isDisabled} TODO: verify needed
    {...selectProps}>
    {(editableField as SelectEditableField<any>).options.map((option) => (
      <MenuItem key={option.value} value={option.value || undefined}>
        {option.label}
      </MenuItem>
    ))}
  </Select>
)

export default DropdownInput
