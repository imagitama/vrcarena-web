import { QueuedItemFailureInfo } from '@/queues'
import Tooltip from '../tooltip'

// TODO: move to more specific spot
export enum AssetSyncFailureInfoCode {
  Unknown = 'Unknown',
  ScrapeOther = 'ScrapeOther',
  ElementNotFound = 'ElementNotFound',
  InvalidProductUrl = 'InvalidProductUrl',
  Stalled = 'Stalled', // times out / runs out of memory
  ProductNotFound = 'ProductNotFound',
  RequestBlocked = 'RequestBlocked',
  AssetAlreadyExists = 'AssetAlreadyExists',
  FailedToCreateAsset = 'FailedToCreateAsset',
}

enum AiErrorCode {
  AiOverloaded = 'AiOverloaded',
  AiQuotaExceeded = 'AiQuotaExceeded',
  PromptBlocked = 'PromptBlocked',
  PromptEndedEarly = 'PromptEndedEarly',
  Unknown = 'unknown',
}

type MessageMap = { [errorName: string]: string }

const getFriendlyMessageFromFailureInfo = (
  failureInfo: QueuedItemFailureInfo<any>,
  messages?: MessageMap
): string => {
  // TODO: better type-safety for data

  switch (failureInfo.code) {
    case AssetSyncFailureInfoCode.RequestBlocked:
      return 'The platform blocked our request (eg. with CloudFlare)'
    case AssetSyncFailureInfoCode.ElementNotFound:
      return 'We found the product but the page was missing some required data'
    case AssetSyncFailureInfoCode.ScrapeOther:
      return 'We found the product but something stopped us from getting data (eg. you must login to continue, they changed their HTML page structure, etc.)'
    case AssetSyncFailureInfoCode.InvalidProductUrl:
      return `The platform told us the URL is invalid: ${failureInfo.data.url}`
    case AssetSyncFailureInfoCode.ProductNotFound:
      return `The platform told us the product does not exist (404)`
    case AssetSyncFailureInfoCode.Stalled:
      return 'We spent too long processing this asset (it might have some 4K images that caused us to run out of memory)'
    case AssetSyncFailureInfoCode.FailedToCreateAsset:
      return 'An asset with that source URL already exists'
    case AiErrorCode.PromptBlocked:
      return `The AI blocked our prompt: ${failureInfo.data.reason}`
    case AiErrorCode.PromptEndedEarly:
      return `The AI ended their response early: ${failureInfo.data.finishReason}`
    default:
      if (messages && failureInfo.error in messages)
        return messages[failureInfo.error]

      return `Error: ${failureInfo.error}`
  }
}

const FailureInfoOutput = ({
  failureInfo,
  messages,
}: {
  failureInfo: QueuedItemFailureInfo<any>
  messages?: MessageMap
}) => {
  return (
    <Tooltip title={JSON.stringify(failureInfo, null, '  ')}>
      <span>{getFriendlyMessageFromFailureInfo(failureInfo, messages)}</span>
    </Tooltip>
  )
}

export default FailureInfoOutput
