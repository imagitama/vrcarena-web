import React from 'react'
import MaterialTooltip, { TooltipProps } from '@material-ui/core/Tooltip'

const Tooltip = (props: TooltipProps) => (
  <MaterialTooltip arrow placement="top" {...props} />
)

export default Tooltip
