import React from 'react'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectProps } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

export { MenuItem }

export default ({ label, id, ...props }: SelectProps & { label?: string }) => {
  const labelId = id ? `${id}-label` : undefined
  return (
    <FormControl
      variant="outlined"
      fullWidth={props.fullWidth}
      size={props.size}>
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <Select labelId={labelId} id={id} label={label} {...props} />
    </FormControl>
  )
}
