import React from 'react'
import MaterialTooltip, { TooltipProps } from '@mui/material/Tooltip'

const Tooltip = (props: TooltipProps) => (
  <MaterialTooltip arrow placement="top" {...props} />
)

export default Tooltip
