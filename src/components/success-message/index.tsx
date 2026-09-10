import React from 'react'
import CheckIcon from '@mui/icons-material/Check'

import Message, { MessageProps } from '@/components/message'
import Button from '@/components/button'

const SuccessMessage = ({
  onOkay,
  viewRecordUrl,
  controls,
  ...props
}: MessageProps & {
  onOkay?: () => void
  viewRecordUrl?: string
  controls?: React.ReactNode | React.ReactNode[]
}) => {
  const customControls =
    onOkay || viewRecordUrl ? (
      <>
        {onOkay ? (
          <Button
            onClick={onOkay}
            icon={<CheckIcon />}
            color="secondary"
            size="small">
            Okay
          </Button>
        ) : undefined}
        {viewRecordUrl && (
          <Button url={viewRecordUrl} color="secondary" size="small">
            View Record
          </Button>
        )}
      </>
    ) : undefined

  const mergedControls =
    customControls || controls ? (
      <>
        {customControls}
        {controls}
      </>
    ) : undefined

  return (
    <Message
      icon={<CheckIcon />}
      color="#003602"
      controls={mergedControls}
      {...props}
    />
  )
}

export default SuccessMessage
