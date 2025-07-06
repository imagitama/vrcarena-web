import React from 'react'
import Badge, { BadgeProps } from '../badge'

const DeletedBadge = (props: Omit<BadgeProps, 'children'>) => (
  <Badge title="This user has been deleted." {...props}>
    Deleted
  </Badge>
)

export default DeletedBadge
