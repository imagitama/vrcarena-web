import React from 'react'
import Badge, { BadgeProps } from '@/components/badge'

const DeletedBadge = (props: Omit<BadgeProps, 'children'>) => (
  <Badge title="This user has been deleted." {...props}>
    Deleted
  </Badge>
)

export default DeletedBadge
