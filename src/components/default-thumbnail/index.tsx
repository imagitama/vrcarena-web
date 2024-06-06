import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { ReactComponent as ChariotImage } from '../../assets/images/chariot.svg'

const useStyles = makeStyles({
  root: {
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    opacity: 0.05,
  },
})

const DefaultThumbnail = () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <ChariotImage />
    </div>
  )
}

export default DefaultThumbnail
