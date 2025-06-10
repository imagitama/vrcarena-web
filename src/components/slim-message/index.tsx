import React from 'react'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  message: {
    padding: '0.5rem',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: '0.5rem',
    },
  },
})

export default ({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) => {
  const classes = useStyles()
  return (
    <p className={`${classes.message} ${className}`} onClick={onClick}>
      {children}
    </p>
  )
}
