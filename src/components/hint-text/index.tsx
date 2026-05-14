import React from 'react'
import { makeStyles } from '@mui/styles'
import { colorGreyedOut } from '@/themes'

const useStyles = makeStyles({
  root: {
    color: colorGreyedOut,
  },
  small: {
    fontSize: '75%',
  },
})

const HintText = ({
  children,
  small,
  className = '',
}: {
  children: React.ReactNode
  small?: boolean
  className?: string
}) => {
  const classes = useStyles()
  return (
    <span
      className={`${classes.root} ${small ? classes.small : ''} ${className}`}>
      {children}
    </span>
  )
}

export default HintText
