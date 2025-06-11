import React from 'react'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
  '@global': {
    '@keyframes shimmer': {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
  },
  root: {
    width: '100%',
    height: '1em',
    display: 'inline-block',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#3b3b3b',
    '&:after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      transform: 'translateX(-100%)',
      backgroundImage:
        'linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.1) 20%, rgba(255, 255, 255, 0.3) 60%, rgba(255, 255, 255, 0))',
      animation: `shimmer 2s infinite`,
    },
  },
})

export default ({
  width,
  height,
}: {
  width?: number | string
  height?: number | string
}) => {
  const classes = useStyles()
  return <div className={classes.root} style={{ width, height }} />
}
