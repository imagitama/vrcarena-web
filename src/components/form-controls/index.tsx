import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    margin: '0.5rem 0',
    '& > *': {
      margin: '0 0.25rem',
    },
  },
  extraTopMargin: {
    marginTop: '2rem',
  },
})

export default ({
  children,
  className = '',
  extraTopMargin = false,
}: {
  children: React.ReactNode
  className?: string
  extraTopMargin?: boolean
}) => {
  const classes = useStyles()
  return (
    <div
      className={`${classes.root} ${className} ${
        extraTopMargin ? classes.extraTopMargin : ''
      }`}>
      {children}
    </div>
  )
}
