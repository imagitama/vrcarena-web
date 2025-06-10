import React from 'react'
import CheckIcon from '@mui/icons-material/Check'
import Message, { MessageProps } from '../message'
import Button from '../button'

export default ({
  onOkay,
  ...props
}: MessageProps & { onOkay?: () => void }) => (
  <Message
    icon={<CheckIcon />}
    color="#003602"
    controls={
      onOkay ? (
        <Button onClick={onOkay} icon={<CheckIcon />} color="secondary">
          Okay
        </Button>
      ) : undefined
    }
    {...props}
  />
)
