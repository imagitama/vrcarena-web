import React from 'react'
import { makeStyles } from '@mui/styles'
import Message from '../message'
import Chariot from '../chariot'

const useStyles = makeStyles({
  icon: {
    height: '2em !important',
  },
})

const LoadingMessage = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return (
    <Message icon={<Chariot spin className={classes.icon} />}>
      {children || 'Loading...'}
    </Message>
  )
}

export default LoadingMessage
