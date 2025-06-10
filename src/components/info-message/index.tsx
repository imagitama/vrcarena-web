import React from 'react'
import InfoIcon from '@mui/icons-material/Info'
import CheckIcon from '@mui/icons-material/Check'

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
        <Button onClick={onOkay} icon={<CheckIcon />} color="secondary">
          Okay
        </Button>
      ) : undefined
    }>
    {title ? children : null}
  </Message>
)
