import styled from '@emotion/styled'

import FormattedDate from '../formatted-date'
import QueueStatusLabel from '../queue-status-label'
import { QueuedItem } from '@/queues'
import FailureInfoOutput from '../failure-info-output'
import ConnectionIndicator, {
  ConnectionStatus,
  getConnectionLabel,
} from '../connection-indicator'
import Tooltip from '../tooltip'

const Metadata = styled.small`
  display: block;
  margin-top: -2px;
`

const AiResultSummary = ({
  queuedItem,
  connectionStatus,
}: {
  queuedItem: QueuedItem
  connectionStatus?: ConnectionStatus
}) => {
  return (
    <>
      <QueueStatusLabel id={queuedItem.id} status={queuedItem.status} />
      <Metadata>
        {connectionStatus !== undefined && (
          <Tooltip title={getConnectionLabel(connectionStatus)}>
            <ConnectionIndicator status={connectionStatus} />
          </Tooltip>
        )}{' '}
        <FormattedDate
          date={queuedItem.lastmodifiedat || queuedItem.createdat}
        />
      </Metadata>
      {queuedItem.failureinfo && (
        <FailureInfoOutput failureInfo={queuedItem.failureinfo} />
      )}
    </>
  )
}

export default AiResultSummary
