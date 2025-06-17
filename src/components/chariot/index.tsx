import React from 'react'
import { makeStyles } from '@mui/styles'
import { ReactComponent as ChariotImage } from '../../assets/images/chariot.svg'
import { ReactComponent as ChristmasHat } from '../../assets/images/christmas-hat.svg'
import { getIsChristmasTime } from '../../utils'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    height: '100%',
  },
  hat: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '25%',
    height: '25%',
    transform: 'translate(-100%, -50%) scale(-1, 1)',
  },
  chariot: {
    width: '100%',
    height: '100%',
  },
  spin: {
    '& #g23412': {
      transformOrigin: 'center',
      transformBox: 'fill-box',
      animation: '$spinWheel 1s linear infinite',
    },
  },
  spinOnHover: {
    '&:hover #g23412': {
      transformOrigin: 'center',
      transformBox: 'fill-box',
      animation: '$spinWheel 10s linear infinite',
    },
  },
  '@keyframes spinWheel': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
})

const Chariot = ({
  spin = false,
  spinOnHover = false,
  className,
}: {
  spin?: boolean
  spinOnHover?: boolean
  className?: string
}) => {
  const classes = useStyles()
  return (
    <div
      className={`${classes.root} ${spin ? classes.spin : ''} ${
        spinOnHover ? classes.spinOnHover : ''
      } ${className || ''}`}>
      {getIsChristmasTime() && <ChristmasHat className={classes.hat} />}
      <ChariotImage className={classes.chariot} />
    </div>
  )
}

export default Chariot
