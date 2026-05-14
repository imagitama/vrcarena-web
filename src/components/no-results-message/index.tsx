import React from 'react'
import { makeStyles } from '@mui/styles'
import Button from '@/components/button'
import { colorGreyedOut } from '@/themes'
import { mediaQueryForMobiles } from '@/media-queries'

const useStyles = makeStyles({
  root: {
    textAlign: 'center',
    margin: '1rem 0',
    color: colorGreyedOut,
    [mediaQueryForMobiles]: {
      margin: '0.5rem 90',
    },
  },
  msg: {
    display: 'block',
    fontStyle: 'italic',
  },
  btn: {
    marginTop: '1rem',
  },
  noMargin: {
    margin: 0,
  },
})

const NoResultsMessage = ({
  children,
  callToActionLabel = '',
  callToActionUrl = '',
  noMargin,
}: {
  children?: React.ReactNode
  callToActionLabel?: string
  callToActionUrl?: string
  noMargin?: boolean
}) => {
  const classes = useStyles()
  return (
    <div className={`${classes.root} ${noMargin ? classes.noMargin : ''}`}>
      <span className={classes.msg}>{children || 'No results found'}</span>
      {callToActionLabel && callToActionUrl ? (
        <Button url={callToActionUrl} className={classes.btn}>
          {callToActionLabel}
        </Button>
      ) : null}
    </div>
  )
}

export default NoResultsMessage
