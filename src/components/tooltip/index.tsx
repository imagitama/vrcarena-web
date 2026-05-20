import React from 'react'
import MaterialTooltip, { TooltipProps } from '@mui/material/Tooltip'

const Tooltip = (props: TooltipProps) => (
  <MaterialTooltip
    arrow
    placement="top"
    enterTouchDelay={300}
    leaveTouchDelay={2000}
    {...props}
  />
)

export default Tooltip
