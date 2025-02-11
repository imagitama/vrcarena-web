import React from 'react'
import Select, { SelectProps } from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

export { MenuItem }

export default (props: SelectProps) => <Select variant="outlined" {...props} />
