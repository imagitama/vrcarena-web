import React, { Fragment } from 'react'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '../../../select'
import { Option } from '../../../../editable-fields'

export default ({
  onChange,
  value = null,
  options,
}: {
  onChange: (newVal: any) => void
  value: string | null
  options: Option[]
}) => (
  <Select
    //   fullWidth
    value={value}
    onChange={(e: any) => onChange(e.target.value)}>
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value || undefined}>
        {option.label}
      </MenuItem>
    ))}
  </Select>
)
