import { QueuedItemFailureInfo } from '@/queues'

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
      return `Error: ${failureInfo.error}`
  }
}

const FailureInfoOutput = ({
  failureInfo,
}: {
  failureInfo: QueuedItemFailureInfo<any>
}) => {
  return (
    <div>
      <small>{getFriendlyMessageFromFailureInfo(failureInfo)}</small>
    </div>
  )
}

export default FailureInfoOutput
