export enum MessageType {
  String = 'string',
  Strings = 'strings',
  Candidates = 'candidates',
  FuncResult = 'funcresult',
  PromptFeedback = 'promptfeedback'
}

export interface BaseAiConvoMessage<T> {
  from: 'user' | 'model' // copied from "role"
  type: MessageType
  contents: T
}

export interface AiConvoStringMessage extends BaseAiConvoMessage<string> {
  type: MessageType.String
  contents: string
  promptVersion?: string
}

export interface AiConvoStringsMessage extends BaseAiConvoMessage<string[]> {
  type: MessageType.Strings
  contents: string[]
}

export interface AiConvoCandidatesMessage<T> extends BaseAiConvoMessage<T> {
  type: MessageType.Candidates
  contents: T
}

export interface AiConvoFuncResultMessage<T> extends BaseAiConvoMessage<T> {
  type: MessageType.FuncResult
  contents: T
}

export interface GeminiFeedback {
  blockReason: string | null,
  safetyRatings: string[] | null
}

export interface AiConvoPromptFeedbackMessage extends BaseAiConvoMessage<GeminiFeedback> {
  type: MessageType.PromptFeedback
  contents: GeminiFeedback
}

export type AiConvoMessage<TCandidates, TFuncResult> = AiConvoStringMessage | AiConvoStringsMessage | AiConvoCandidatesMessage<TCandidates> | AiConvoFuncResultMessage<TFuncResult> | AiConvoPromptFeedbackMessage

// TODO: make all AI stuff extend from this
export interface AiConvo {
  modelName: string
  messages: null | AiConvoMessage<any, any>[]
  ignore?: boolean
}