import React from 'react'
import { makeStyles } from '@mui/styles'
import { mediaQueryForMobiles } from '../../media-queries'

const useStyles = makeStyles({
  controls: {
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex',
    [mediaQueryForMobiles]: {
      position: 'relative',
      margin: '0.5rem 0',
    },
    '& > *': {
      marginLeft: '0.25rem',
    },
  },
})

export default ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <div className={classes.controls}>{children}</div>
}
