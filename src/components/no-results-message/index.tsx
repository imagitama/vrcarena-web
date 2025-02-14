import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../button'

const useStyles = makeStyles({
  root: {
    textAlign: 'center',
    margin: '2rem 0',
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
