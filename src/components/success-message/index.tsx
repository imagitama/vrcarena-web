import React from 'react'
import CheckIcon from '@mui/icons-material/Check'
import Message, { MessageProps } from '../message'
import Button from '../button'

export default ({
  onOkay,
  viewRecordUrl,
  ...props
}: MessageProps & { onOkay?: () => void; viewRecordUrl?: string }) => (
  <Message
    icon={<CheckIcon />}
    color="#003602"
    controls={
      onOkay || viewRecordUrl ? (
        <>
          {onOkay ? (
            <Button onClick={onOkay} icon={<CheckIcon />} color="secondary">
              Okay
            </Button>
          ) : undefined}
          {viewRecordUrl && (
            <Button url={viewRecordUrl} color="secondary">
              View Record
            </Button>
          )}
        </>
      ) : undefined
    }
    {...props}
  />
)
