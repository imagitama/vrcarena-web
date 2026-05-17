import { AiConvoMessage } from '@/ai'
import { QueueStatus as AiSimilarQueuedItemStatus } from './common'
import { QueuedItem } from '@/queues'

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
}

export enum CollectionNames {
  AiSimilarQueue = 'aisimilarqueue',
}

export { AiSimilarQueuedItemStatus }
