import React from 'react'
import Paper from '@mui/material/Paper'
import { makeStyles } from '@mui/styles'
import { VRCArenaTheme } from '../../themes'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    padding: '1rem',
    transition: 'all 100ms',
    margin: '1rem 0',
  },
  noMargin: {
    margin: '0',
  },
  // hover: {
  //   '&:hover': {
  //     backgroundColor: 'grey',
  //     // @ts-ignore
  //     boxShadow: `0px 0px 10px #FFF`,
  //   },
  // },
  // selected: {
  //   backgroundColor: 'grey',
  //   // @ts-ignore
  //   boxShadow: `0px 0px 10px #FFF`,
  // },
}))

export default ({
  children,
  hover = false,
  selected = false,
  margin = false,
  className = '',
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
      } ${className} ${margin ? '' : classes.noMargin}`}>
      {children}
    </Paper>
  )
}
