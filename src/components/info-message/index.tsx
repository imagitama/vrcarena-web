import React from 'react'
import InfoIcon from '@mui/icons-material/Info'
import CheckIcon from '@mui/icons-material/Check'

import Message, { MessageProps } from '../message'
import Button from '../button'

export default ({
  title,
  children,
  onOkay,
  ...messageProps
}: {
  onOkay?: () => void
} & MessageProps) => (
  <Message
    {...messageProps}
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
