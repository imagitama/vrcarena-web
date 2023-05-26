import { makeStyles } from '@material-ui/styles'
import React from 'react'

const useStyles = makeStyles({
  root: {
    fontStyle: 'italic'
  },
  small: {
    fontSize: '75%'
  }
})

export default ({
  children,
  small
}: {
  children: React.ReactNode
  small: boolean
}) => {
  const classes = useStyles()
  return (
    <span className={`${classes.root} ${small ? classes.small : ''}`}>
      {children}
    </span>
  )
}
