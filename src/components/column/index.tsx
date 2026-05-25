import React from 'react'
import { makeStyles } from '@mui/styles'
import { mediaQueryForMobiles } from '@/media-queries'

const useStyles = makeStyles({
  column: {
    flex: '1 1 50%', // grow, shrink, basis of 50%
    minWidth: 0, // prevents flex blowout with long content
    [mediaQueryForMobiles]: {
      flex: '1 1 100%', // full width on mobile
    },
  },
  withPadding: {
    padding: '0.5rem',
  },
})

const Column = ({
  children,
  widthPerc: overrideWidthPerc,
  padding = false,
}: {
  children: React.ReactNode
  widthPerc?: number
  padding?: boolean
}) => {
  const classes = useStyles()
  return (
    <div
      className={`${classes.column} ${padding ? classes.withPadding : ''}`}
      style={
        overrideWidthPerc
          ? { width: `${overrideWidthPerc}%`, flex: 'auto' }
          : {}
      }>
      {children}
    </div>
  )
}

export default Column
