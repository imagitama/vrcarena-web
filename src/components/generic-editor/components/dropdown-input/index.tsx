import React, { Fragment } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { SelectProps } from '@mui/material/Select'
import Select from '../../../select'
import { Option } from '../../../../editable-fields'

const DropdownInput = ({
  onChange,
  value = null,
  options,
  isDisabled = false,
  ...selectProps
}: {
  onChange: (newVal: any) => void
  value: string | null
  options: Option[]
  isDisabled?: boolean
} & SelectProps) => (
  <Select
    value={value}
    onChange={(e: any) => onChange(e.target.value)}
    disabled={isDisabled}
    {...selectProps}>
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value || undefined}>
        {option.label}
      </MenuItem>
    ))}
  </Select>
)

export default DropdownInput
