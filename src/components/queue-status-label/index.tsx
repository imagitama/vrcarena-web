import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'

import { QueueStatus } from '@/modules/common'
import StatusText from '@/components/status-text'
import CopyThing from '@/components/copy-thing'

const getPositivityForStatus = (status: QueueStatus): number => {
  switch (status) {
    case QueueStatus.Failed:
      return -1
    case QueueStatus.Processed:
      return 1
    case QueueStatus.Processing:
      return 0
    case QueueStatus.Queued:
      return 0
  }
}

const getIconForStatus = (status: QueueStatus) => {
  switch (status) {
    case QueueStatus.Failed:
      return <CloseIcon />
    case QueueStatus.Processed:
      return <CheckIcon />
    case QueueStatus.Processing:
      return <HourglassEmptyIcon />
    case QueueStatus.Queued:
      return null
  }
}

const getStatusPastTense = (status: QueueStatus): string => {
  switch (status) {
    case QueueStatus.Processed:
      return 'Completed'
    case QueueStatus.Failed:
      return 'Failed'
    case QueueStatus.Processing:
      return 'Processing'
    case QueueStatus.Queued:
      return 'Queued'
    default:
      return status
  }
}

const QueueStatusLabel = ({
  id,
  status,
}: {
  id: string
  status: QueueStatus
}) => (
  <CopyThing title="Click to copy ID" text={id}>
    <StatusText positivity={getPositivityForStatus(status)}>
      {getStatusPastTense(status)} {getIconForStatus(status)}
    </StatusText>
  </CopyThing>
)

export default QueueStatusLabel
