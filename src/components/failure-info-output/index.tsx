import { QueuedItemFailureInfo } from '@/queues'
import Tooltip from '../tooltip'

// TODO: move to more specific spot
enum AssetSyncFailureInfoCode {
  Unknown = 'Unknown',
  ScrapeOther = 'ScrapeOther',
  ElementNotFound = 'ElementNotFound',
  InvalidProductUrl = 'InvalidProductUrl',
}

const getFriendlyMessageFromFailureInfo = (
  failureInfo: QueuedItemFailureInfo<any>
): string => {
  switch (failureInfo.code) {
    case AssetSyncFailureInfoCode.ElementNotFound:
      return 'We found the product but the page was missing some required data'
    case AssetSyncFailureInfoCode.ScrapeOther:
      return 'We found the product but something stopped us from getting any data'
    case AssetSyncFailureInfoCode.InvalidProductUrl:
      return `The platform has told us the URL is invalid: ${failureInfo.data.url}`
    default:
      switch (failureInfo.error) {
        // TODO: use error code
        case 'AutoSyncErrorAssetAlreadyExists':
          return `An asset with that source URL already exists`
      }
      return `Error: ${failureInfo.error}`
  }
}

const FailureInfoOutput = ({
  failureInfo,
}: {
  failureInfo: QueuedItemFailureInfo<any>
}) => {
  return (
    <Tooltip title={JSON.stringify(failureInfo, null, '  ')}>
      <small>{getFriendlyMessageFromFailureInfo(failureInfo)}</small>
    </Tooltip>
  )
}

export default FailureInfoOutput
