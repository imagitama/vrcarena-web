import { QueuedItemFailureInfo } from '@/queues'
import Tooltip from '../tooltip'

// TODO: move to more specific spot
enum AssetSyncFailureInfoCode {
  Unknown = 'Unknown',
  ScrapeOther = 'ScrapeOther',
  ElementNotFound = 'ElementNotFound',
  InvalidProductUrl = 'InvalidProductUrl',
}

enum AiErrorCode {
  AiOverloaded = 'AiOverloaded',
  AiQuotaExceeded = 'AiQuotaExceeded',
  PromptBlocked = 'PromptBlocked',
  PromptEndedEarly = 'PromptEndedEarly',
  Unknown = 'unknown',
}

const getFriendlyMessageFromFailureInfo = (
  failureInfo: QueuedItemFailureInfo<any>
): string => {
  // TODO: better type-safety for data

  switch (failureInfo.code) {
    case AssetSyncFailureInfoCode.ElementNotFound:
      return 'We found the product but the page was missing some required data'
    case AssetSyncFailureInfoCode.ScrapeOther:
      return 'We found the product but something stopped us from getting any data'
    case AssetSyncFailureInfoCode.InvalidProductUrl:
      return `The platform told us the URL is invalid: ${failureInfo.data.url}`
    case AiErrorCode.PromptBlocked:
      return `The AI blocked our prompt: ${failureInfo.data.reason}`
    case AiErrorCode.PromptEndedEarly:
      return `The AI ended their response early: ${failureInfo.data.finishReason}`
    default:
      // TODO: use error codes for these
      switch (failureInfo.error) {
        case 'AutoSyncErrorAssetAlreadyExists':
          return `An asset with that source URL already exists`
        case 'ScrapeErrorRequestNotOk':
          return 'We failed to visit the URL (are you sure it exists?)'
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
      <span>{getFriendlyMessageFromFailureInfo(failureInfo)}</span>
    </Tooltip>
  )
}

export default FailureInfoOutput
