import React from 'react'
import MaterialTooltip, { TooltipProps } from '@mui/material/Tooltip'
import InfoIcon from '@mui/icons-material/Info'

const Tooltip = (props: TooltipProps) => (
  <MaterialTooltip
    arrow
    placement="top"
    enterTouchDelay={300}
    leaveTouchDelay={2000}
    {...props}
  />
)

export const InfoIconWithTooltip = (props: TooltipProps) => (
  <Tooltip {...props}>
    <InfoIcon />
  </Tooltip>
)

export default Tooltip
