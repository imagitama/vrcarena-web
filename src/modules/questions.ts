export interface QuestionFields extends Record<string, unknown> {
  question: string
  isoriginalcreator: boolean
  asset: string
}

export interface Question extends QuestionFields {
  id: string
  createdby: string
  createdat: Date
  lastmodifiedby: string
  lastmodifiedat: Date
}

export interface FullQuestion extends Question {
  createdbyusername: string
  answers: FullQuestionAnswer[]
}

export interface QuestionAnswerFields extends Record<string, unknown> {
  parent: string // question ID
  answer: string
  sourceurl: string
  isoriginalcreator: boolean
}

export interface QuestionAnswer extends QuestionAnswerFields {
  id: string
  createdby: string
  createdat: Date
  lastmodifiedby: string
  lastmodifiedat: Date
}

export interface FullQuestionAnswer extends QuestionAnswer {
  createdbyusername: string
}

export const CollectionNames = {
  Questions: 'questions',
  QuestionAnswers: 'questionanswers',
}

export const ViewNames = {
  GetPublicQuestions: 'getpublicquestions',
}
