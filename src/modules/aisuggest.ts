import { AiConvoMessage } from '@/ai'
import { QueueStatus as AiSuggestQueuedItemStatus } from './common'
import { QueuedItem } from '@/queues'

export interface FuncResult {
  suggestions: AiFieldSuggestions
}

export interface AiFieldSuggestion {
  suggestedValue: any
  reason: string
  confidence: number
  options?: string[]
}

export type AiFieldSuggestions = { [fieldName: string]: AiFieldSuggestion }

export interface AiSuggestConvo {
  modelName: string
  messages: null | AiConvoMessage<AiFieldSuggestions, FuncResult>[]
  suggestions: AiFieldSuggestions
  ignore?: boolean
}

export interface AiSuggestQueuedItem extends QueuedItem {
  recordtable: string
  recordid: string
  convogroups: null | AiSuggestConvo[][]
  suggestions: AiFieldSuggestions
}

export enum CollectionNames {
  AiSuggestQueue = 'aisuggestqueue',
}

export enum FunctionNames {
  RequestAiSuggestion = 'request_ai_suggestion'
}

export { AiSuggestQueuedItemStatus }
