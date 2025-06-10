import React from 'react'
import { makeStyles } from '@mui/styles'
import { VRCArenaTheme } from '../../themes'

interface BoxProps {
  children?: React.ReactNode
  color?: string
  icon?: React.ReactElement
  className?: string
}

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    outline: (props: BoxProps) =>
      `1px solid ${props.color || theme.palette.background.paper}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'normal',
  },
  edge: {
    padding: '0.5rem',
    background: (props: BoxProps) =>
      props.color || theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      width: '2rem',
      height: '2rem',
      fill: theme.palette.common.white,
    },
  },
  content: {
    overflow: 'hidden', // prevent horizontal overflow with tiny assets
    padding: '0.5rem',
  },
}))

const Box = (props: BoxProps) => {
  const classes = useStyles(props)
  return (
    <div className={`${classes.root} ${props.className}`}>
      <div className={classes.edge}>{props.icon}</div>
      <div className={classes.content}>{props.children}</div>
    </div>
  )
}

export default Box
