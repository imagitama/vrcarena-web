import InfoIcon from '@mui/icons-material/Info'
import React from 'react'
import CheckIcon from '@mui/icons-material/Check'

import Message, { MessageProps } from '@/components/message'
import Button from '@/components/button'

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
    title={title !== undefined ? title : children}
    controls={
      onOkay ? (
        <Button onClick={onOkay} icon={<CheckIcon />} color="secondary">
          Okay
        </Button>
      ) : undefined
    }>
    {title !== undefined ? children : null}
  </Message>
)
