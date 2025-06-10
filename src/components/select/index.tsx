import React from 'react'
import Select, { SelectProps } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

export { MenuItem }

export default (props: SelectProps) => <Select variant="outlined" {...props} />
