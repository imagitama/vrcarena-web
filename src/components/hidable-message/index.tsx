import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import useNotice from '../../hooks/useNotice'
import Message from '../message'

const useStyles = makeStyles({
  hideBtn: {
    position: 'absolute',
    padding: '0.5rem',
    top: 0,
    right: 0,
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

const HidableMessage = ({
  noticeId,
  children,
  ...messageProps
}: {
  noticeId: string
  children: React.ReactNode
}) => {
  const [isHidden, hideMessage] = useNotice(noticeId)
  const classes = useStyles()

  if (isHidden) {
    return null
  }

  return (
    <Message {...messageProps}>
      {children}
      <div className={classes.hideBtn} onClick={hideMessage}>
        <CloseIcon />
      </div>
    </Message>
  )
}

export default HidableMessage
