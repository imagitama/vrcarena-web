import React from 'react'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  root: {
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  small: {
    fontSize: '75%',
  },
})

const HintText = ({
  children,
  small,
}: {
  children: React.ReactNode
  small?: boolean
}) => {
  const classes = useStyles()
  return (
    <span className={`${classes.root} ${small ? classes.small : ''}`}>
      {children}
    </span>
  )
}

export default HintText
