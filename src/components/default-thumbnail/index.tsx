import React from 'react'
import { makeStyles } from '@mui/styles'
import { ReactComponent as ChariotImage } from '../../assets/images/chariot.svg'

const useStyles = makeStyles({
  root: {
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    opacity: 0.05,
    '& svg': {
      width: '100%',
      height: '100%',
    },
  },
  tiny: {
    height: '100px',
  },
})

const DefaultThumbnail = ({ isTiny }: { isTiny?: boolean }) => {
  const classes = useStyles()
  return (
    <div className={`${classes.root} ${isTiny ? classes.tiny : ''}`}>
      <ChariotImage />
    </div>
  )
}

export default DefaultThumbnail
