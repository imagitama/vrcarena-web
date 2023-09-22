export interface Survey {
  title: string
  questions: SurveyQuestion[]
  allowFinalComments?: boolean
}

export interface SurveyQuestion {
  question: string
  optional?: boolean
  options?: string[]
  allowMultiple?: boolean
  allowComments?: boolean
  commentsTitle?: string
}
