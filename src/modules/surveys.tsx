import { EditableField } from '@/editable-fields'
import { fieldTypes } from '@/generic-forms'
import SurveyQuestionsEditor from '@/components/survey-questions-editor'

export enum SurveyQuestionType {
  Text = 'text',
}

export interface SurveyQuestion {
  question: string // in plain english
  type: SurveyQuestionType
}

export interface SurveyFields extends Record<string, unknown> {
  questions: SurveyQuestion[]
  isactive: boolean
}

export interface Survey extends SurveyFields {
  id: string
  lastmodifiedat: string | null // date
  lastmodifiedby: string | null
  createdat: string // date
  createdby: string
}

export interface FullSurvey extends Survey {
  createdbyusername: string
  createdbyavatarurl: string
  lastmodifiedbyusername: string | null
  lastmodifiedbyavatarurl: string | null
}

export interface SurveyResponseAnswer {
  question: string // in plain english
  answer: string
}

export interface SurveyResponseFields extends Record<string, unknown> {
  survey: string // id
  answers: SurveyResponseAnswer[]
}

export interface SurveyResponse extends SurveyResponseFields {
  id: string
  lastmodifiedat: string | null // date
  lastmodifiedby: string | null
  createdat: string // date
  createdby: string
}

export interface FullSurveyResponse extends SurveyResponse {
  createdbyusername: string
  createdbyavatarurl: string
}

export interface GetMySurveyResponse {
  survey: FullSurvey | null
  response: FullSurveyResponse | null
}

export enum CollectionNames {
  Surveys = 'surveys',
  SurveyResponses = 'surveyresponses',
}

export enum ViewNames {
  GetFullSurveys = 'getfullsurveys',
  GetFullSurveyResponses = 'getfullsurveyresponses',
  GetMySurveyResponse = 'getmysurveyresponse',
}

export const editableFields: EditableField<SurveyFields>[] = [
  {
    name: 'isactive',
    type: fieldTypes.checkbox,
    label: 'Is active',
    hint: 'Active surveys are shown to every logged in user that has not submitted a response.',
  },
  {
    name: 'questions',
    type: fieldTypes.custom,
    label: 'Questions',
    renderer: ({ value, onChange }) => (
      <SurveyQuestionsEditor value={value || []} onChange={onChange} />
    ),
  },
]
