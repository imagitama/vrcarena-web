import React from 'react'
import { makeStyles } from '@mui/styles'
import Chip from '@mui/material/Chip'
import Tooltip from '../tooltip'

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
}

export default ({
  title,
  children, // label
  isSmall,
  className = '',
}: BadgeProps) => {
  const classes = useStyles()
  return (
    <Tooltip title={title}>
      <Chip
        label={children}
        size={isSmall ? 'small' : undefined}
        className={`${classes.root} ${className}`}
      />
    </Tooltip>
  )
}
