import {
  CollectionNames,
  GetMySurveyResponse,
  Survey,
  SurveyQuestion,
  SurveyResponse,
  SurveyResponseAnswer,
  SurveyResponseFields,
  ViewNames,
} from '@/modules/surveys'
import Message from '../message'
import useUserRecord from '@/hooks/useUserRecord'
import Button from '../button'
import { useState } from 'react'
import Dialog from '../dialog'
import TextInput from '../text-input'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'
import FormControls from '../form-controls'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import useIsLoggedIn from '@/hooks/useIsLoggedIn'
import useDataStoreItems from '@/hooks/useDataStoreItems'
import useGlobalState from '@/hooks/useGlobalState'

const SurveyDialog = ({
  survey,
  onDone,
}: {
  survey: Survey
  onDone: () => void
}) => {
  const [isCreating, isSuccess, lastErrorCode, create] = useDataStoreCreate<
    SurveyResponseFields,
    SurveyResponse
  >(CollectionNames.SurveyResponses)
  const [newAnswers, setNewAnswers] = useState<SurveyResponseAnswer[]>(
    survey.questions.map((question) => ({
      question: question.question,
      answer: '',
    }))
  )

  const onClickSubmit = async () => {
    await create({
      survey: survey.id,
      answers: newAnswers,
    })
  }

  const onAnswerChange = (question: SurveyQuestion, rawTextValue: string) =>
    setNewAnswers((currentAnswers) =>
      currentAnswers.map((answerData) =>
        answerData.question === question.question
          ? {
              ...answerData,
              answer: rawTextValue,
            }
          : answerData
      )
    )

  const isBusy = isCreating || isSuccess

  return (
    <>
      <Dialog>
        Every now and again we ask our signed up users to complete a 1 minute
        survey. Every field is optional. Only staff can see your answers.
        {survey.questions.map((question) => (
          <div key={question.question}>
            {question.question}
            <TextInput
              value={
                newAnswers.find(
                  (answerData) => answerData.question === question.question
                )!.answer
              }
              onChange={(e) => onAnswerChange(question, e.target.value)}
              rows={2}
              multiline
              fullWidth
              isDisabled={isBusy}
            />
          </div>
        ))}
        <FormControls>
          <Button onClick={onDone} color="secondary" isDisabled={isBusy}>
            Cancel
          </Button>{' '}
          <Button onClick={onClickSubmit} isDisabled={isBusy}>
            Submit
          </Button>
        </FormControls>
        {isCreating && (
          <LoadingIndicator message="Submitting survey response..." />
        )}
        {lastErrorCode !== null && (
          <ErrorMessage>
            Failed to submit your response. Please try again later. Code{' '}
            {lastErrorCode}
          </ErrorMessage>
        )}
        {isSuccess && (
          <SuccessMessage>
            Your survey response has been submitted successfully. Thank you for
            helping make this site better! 🩷
            <FormControls>
              <Button onClick={() => onDone()}>Hide Dialog</Button>
            </FormControls>
          </SuccessMessage>
        )}
      </Dialog>
    </>
  )
}

const SurveyMessage = () => {
  const [, , globalState] = useGlobalState()
  const isLoggedIn = useIsLoggedIn()
  const [, , user] = useUserRecord()
  const [, , results, , hydrate] = useDataStoreItems<GetMySurveyResponse>(
    ViewNames.GetMySurveyResponse,
    user && globalState && globalState.activesurveyid ? undefined : false
  )
  const [isOpen, setIsOpen] = useState(false)

  if (!isLoggedIn || !user || !user.username || !results || !results.length)
    return null

  const myResponse = results[0]

  if (!myResponse.survey || myResponse.response) return null

  const onClickOpen = () => setIsOpen(true)

  return (
    <>
      <Message hideId={`survey_${myResponse.survey}`}>
        Hi {user.username}! Do you have 1 minute to complete a quick survey to
        help us improve the site?
        <FormControls>
          <Button onClick={onClickOpen}>Take The Survey</Button>
        </FormControls>
      </Message>
      {isOpen && (
        <SurveyDialog
          survey={myResponse.survey}
          onDone={() => {
            setIsOpen(false)
            hydrate()
          }}
        />
      )}
    </>
  )
}

export default SurveyMessage
