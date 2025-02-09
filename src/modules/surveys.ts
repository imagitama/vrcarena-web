export interface SurveyQuestionResponse {
  originalQuestion: string
  options?: string[]
  comments?: string
}

export interface SurveyResponse extends Record<string, unknown> {
  parenttable: string
  parent: string
  questionresponses: SurveyQuestionResponse[]
}

export interface SurveyResponseRecord extends SurveyResponse {
  id: string
  createdat: string
  createdby: string
}

export const CollectionNames = {
  SurveyResponses: 'surveyresponses',
}
