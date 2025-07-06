import React from 'react'
import Badge, { BadgeProps } from '../badge'

const StaffBadge = (props: Omit<BadgeProps, 'children'>) => (
  <Badge
    title="This user is a staff member. They can approve assets and resolve issues with assets and users."
    {...props}>
    Staff
  </Badge>
)

export default StaffBadge
