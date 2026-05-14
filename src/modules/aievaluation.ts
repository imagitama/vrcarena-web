import { QueueStatus as AiEvaluateQueuedItemStatus } from './common'

// used by AI evaluation only (newer code just dumps args)
export interface GeminiFuncResult<TArgs> {
  args: TArgs
  id: string
  name: string
}

export interface GeminiAssetEvaluationFunctionResult {
  evaluation: GeminiAssetEvaluation
}

export interface GeminiAssetEvaluationResult {
  evaluation: GeminiAssetEvaluation
  modelName: string
  messages: string[]
}

export interface GeminiAssetEvaluation {
  score: number
  score_reason: string
  score_reason_tags: string[]
}

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
