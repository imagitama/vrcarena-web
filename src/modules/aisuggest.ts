import { AiConvoMessage } from '@/ai'
import { QueueStatus as AiSuggestQueuedItemStatus, QueuedItem } from './common'

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
  notes: string | null // TODO: move to QueuedItem (after verifying)
  lastmodifiedat: string | null // date TODO: move to QueuedItem (after verifying)
}

export enum CollectionNames {
  AiSuggestQueue = 'aisuggestqueue',
}

export { AiSuggestQueuedItemStatus }
