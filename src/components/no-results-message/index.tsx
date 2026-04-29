import React from 'react'
import { makeStyles } from '@mui/styles'
import Button from '@/components/button'

const useStyles = makeStyles({
  root: {
    textAlign: 'center',
    margin: '2rem 0',
    color: 'rgba(255,255,255,0.5)',
  },
  msg: {
    display: 'block',
    fontStyle: 'italic',
  },
  btn: {
    marginTop: '1rem',
  },
})

const NoResultsMessage = ({
  children,
  callToActionLabel = '',
  callToActionUrl = '',
}: {
  children?: React.ReactNode
  callToActionLabel?: string
  callToActionUrl?: string
}) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
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
