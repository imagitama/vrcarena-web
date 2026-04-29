import { QueueStatus as AiEvaluateQueuedItemStatus } from './common'

export interface AiEvaluateConvo {
  model: string
  score: number
  messages: null | string[]
  tags: null | string[]
}

export interface AiEvaluateQueuedItem extends Record<string, any> {
  id: string
  recordtable: string
  recordid: string
  status: AiEvaluateQueuedItemStatus
  convos: null | AiEvaluateConvo[]
  score: number | null
  tags: null | string[]
  notes: string | null
  lastmodifiedat: string | null // date
  createdat: string // date
}

export enum CollectionNames {
  AiEvaluateQueue = 'aievaluatequeue',
}

export { AiEvaluateQueuedItemStatus }
