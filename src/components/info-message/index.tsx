import React from 'react'
import InfoIcon from '@material-ui/icons/Info'
import CheckIcon from '@material-ui/icons/Check'

import Message from '../message'
import Button from '../button'

export default ({
  title,
  children,
  onOkay,
}: {
  title?: React.ReactNode
  children: React.ReactNode
  onOkay?: () => void
}) => (
  <Message
    icon={<InfoIcon />}
    title={title || children}
    controls={
      onOkay ? (
        <Button onClick={onOkay} icon={<CheckIcon />} color="default">
          Okay
        </Button>
      ) : undefined
    }>
    {title ? children : null}
  </Message>
)
