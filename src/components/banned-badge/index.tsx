import React from 'react'
import Badge, { BadgeProps } from '../badge'

const BannedBadge = (props: Omit<BadgeProps, 'children'>) => (
  <Badge title="This user has been banned." {...props}>
    Banned
  </Badge>
)

export default BannedBadge
