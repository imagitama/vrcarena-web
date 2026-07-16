import React from 'react'
import { makeStyles } from '@mui/styles'
import Chip from '@mui/material/Chip'
import Tooltip from '@/components/tooltip'
import { patreonGoldDark } from '@/themes'

const useStyles = makeStyles({
  root: {
    fontWeight: 'normal',
    cursor: 'default !important',
  },
})

export interface BadgeProps {
  title?: string
  children: string
  isSmall?: boolean
  className?: string
  color?: string
}

export const StaffBadge = (props: Omit<BadgeProps, 'children'>) => (
  <Badge
    title="This user is a staff member. They can approve assets and resolve issues with assets and users."
    {...props}>
    Staff
  </Badge>
)

export const BannedBadge = (props: Omit<BadgeProps, 'children'>) => (
  <Badge title="This user has been banned." {...props}>
    Banned
  </Badge>
)

export const PatronBadge = (props: Omit<BadgeProps, 'children'>) => (
  <Badge
    title="This user is an active Patreon supporter."
    color={patreonGoldDark}
    {...props}>
    Patreon
  </Badge>
)

const Badge = ({
  title,
  children, // label
  isSmall,
  className = '',
  color,
}: BadgeProps) => {
  const classes = useStyles()
  return (
    <Tooltip title={title}>
      <Chip
        label={children}
        size={isSmall ? 'small' : undefined}
        className={`${classes.root} ${className}`}
        style={color ? { backgroundColor: color } : undefined}
      />
    </Tooltip>
  )
}

export default Badge
