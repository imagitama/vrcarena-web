import React from 'react'
import BubbleChartIcon from '@material-ui/icons/BubbleChart'
import { makeStyles } from '@material-ui/core/styles'
import Message, { MessageProps } from '../message'

const useStyles = makeStyles({
  fancyEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '10px',
    background: `repeating-linear-gradient(
            45deg,
            #313c2a,
            #313c2a 10px,
            #384530 10px,
            #384530 20px
          )`,
  },
})

export default (messageProps: MessageProps) => {
  const classes = useStyles()
  return (
    <Message
      icon={<BubbleChartIcon />}
      {...messageProps}
      title={`New Feature: ${messageProps.title}`}>
      {messageProps.children}
      <div className={classes.fancyEffect} />
    </Message>
  )
}
