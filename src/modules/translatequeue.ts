import { AiConvoMessage } from '@/ai'
import { QueueStatus as TranslateQueuedItemStatus } from './common'
import { QueuedItem } from '@/queues'

export { QueueStatus } from './common'

export interface AssetTranslationResult {
  title: string
  description: string
}

export interface TranslateQueuedItem extends QueuedItem {
  recordtable: string | null
  recordid: string | null
  fields: { title: string; description: string }
  locale: string
  result: AssetTranslationResult | null
}

export enum CollectionNames {
  TranslateQueue = 'translatequeue',
}

export enum FunctionNames {
  RequestAssetTranslation = 'request_asset_translation',
}

export { TranslateQueuedItemStatus }
