export enum MessageType {
  String = 'string',
  Candidates = 'candidates',
  FuncResult = 'funcresult',
}

export interface BaseAiConvoMessage<T> {
  from: 'user' | 'model' // copied from "role"
  type: MessageType
  contents: T
}

export interface AiConvoStringMessage extends BaseAiConvoMessage<string> {
  type: MessageType.String
  contents: string
}

export interface AiConvoCandidatesMessage<T> extends BaseAiConvoMessage<T> {
  type: MessageType.Candidates
  contents: T
}

export interface AiConvoFuncResultMessage<T> extends BaseAiConvoMessage<T> {
  type: MessageType.FuncResult
  contents: T
}

export type AiConvoMessage<TCandidates, TFuncResult> = AiConvoStringMessage | AiConvoCandidatesMessage<TCandidates> | AiConvoFuncResultMessage<TFuncResult>

export interface AiConvoBase {
  modelName: string
  messages: null | AiConvoMessage<any, any>[]
  ignore?: boolean
}