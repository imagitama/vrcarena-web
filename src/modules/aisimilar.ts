import { AiConvoMessage } from '@/ai'
import { QueueStatus as AiSimilarQueuedItemStatus, QueuedItem } from './common'

export type AiSimilarFuncResult = {
  similarities: AssetSimilarity[]
}

export interface AiSimilarConvo {
  modelName: string
  messages: null | AiConvoMessage<AssetSimilarity[], AiSimilarFuncResult>[]
  similarities: AssetSimilarity[]
  ignore?: boolean
}

export interface AssetSimilarity {
  id: string
  title: string
  confidence: number
  reason: string
}

export interface AiSimilarQueuedItem extends QueuedItem {
  recordtable: string
  recordid: string
  convogroups: null | AiSimilarConvo[][]
  similarities: AssetSimilarity[] | null
  notes: string | null // TODO: move to QueuedItem (after verifying)
  lastmodifiedat: string | null // date TODO: move to QueuedItem (after verifying)
}

export enum CollectionNames {
  AiSimilarQueue = 'aisimilarqueue',
}

export { AiSimilarQueuedItemStatus }
