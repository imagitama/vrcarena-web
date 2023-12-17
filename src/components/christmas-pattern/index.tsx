import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { ReactComponent as AwtterLineart } from '../../assets/images/lineart/groupsonly/awtter.svg'
import { ReactComponent as TaidumLineart } from '../../assets/images/lineart/groupsonly/taidum.svg'
import { ReactComponent as RexouiumLineart } from '../../assets/images/lineart/groupsonly/rexouium.svg'
// import { ReactComponent as AwtterLineartPattern } from '../../assets/images/awtter-lineart-pattern.svg'

/**
 * The plan is to create lineart of all the popular avatars and make a christmas wrapping effect.
 */

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    padding: '20%',
    // background: '#626262',
    background: '#540d16',
    overflow: 'hidden',
    '& svg': {
      transform: 'scale(2) rotate(10deg)',
      display: 'block',
      opacity: 0.3,
      '& path': {
        stroke: '#FFF !important',
      },
    },
  },
}))

export const DefaultAvatar = () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <svg viewBox="0 0 100 100" version="1.1">
        <defs>
          <pattern
            id="pattern1"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse">
            <AwtterLineart />
          </pattern>
          <pattern
            id="pattern2"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse">
            <TaidumLineart />
          </pattern>
          <pattern
            id="pattern3"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse">
            <RexouiumLineart />
          </pattern>
          <pattern
            id="pattern4"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse">
            <AwtterLineart />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#pattern1)"
          transform="rotate(0)"
          transform-origin="center"
        />
        <rect
          width="100%"
          height="100%"
          fill="url(#pattern2)"
          transform="rotate(90)"
          transform-origin="center"
        />
        <rect
          width="100%"
          height="100%"
          fill="url(#pattern3)"
          transform="rotate(180)"
          transform-origin="center"
        />
        <rect
          width="100%"
          height="100%"
          fill="url(#pattern4)"
          transform="rotate(270)"
          transform-origin="center"
        />
      </svg>
    </div>
  )
}

export default DefaultAvatar
