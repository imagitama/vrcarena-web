import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    padding: '1rem',
    transition: 'all 100ms'
  },
  margin: {
    margin: '1rem 0'
  },
  hover: {
    '&:hover': {
      backgroundColor: 'grey',
      // @ts-ignore
      boxShadow: `0px 0px 10px ${theme.palette.paper.hover.shadow}`
    }
  },
  selected: {
    backgroundColor: 'grey',
    // @ts-ignore
    boxShadow: `0px 0px 10px ${theme.palette.paper.selected.shadow}`
  }
}))

export default ({
  children,
  hover = false,
  selected = false,
  margin = false,
  className = ''
}: {
  children: React.ReactNode
  hover?: boolean
  selected?: boolean
  margin?: boolean
  className?: string
}) => {
  const classes = useStyles()
  return (
    <Paper
      className={`${classes.root} ${hover ? classes.hover : ''} ${
        selected ? classes.selected : ''
      } ${className} ${margin ? classes.margin : ''}`}>
      {children}
    </Paper>
  )
}
