import React, { useState } from 'react'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'
import {
  CollectionNames,
  SurveyQuestionResponse,
  SurveyResponse
} from '../../modules/surveys'
import { Survey, SurveyQuestion } from '../../surveys'
import Button from '../button'
import CheckboxInput from '../checkbox-input'
import ErrorMessage from '../error-message'
import FormControls from '../form-controls'
import Heading from '../heading'
import LoadingIndicator from '../loading-indicator'
import Paper from '../paper'
import SuccessMessage from '../success-message'
import TextInput from '../text-input'

const Question = ({
  question,
  currentResponse,
  onResponseChange
}: {
  question: SurveyQuestion
  currentResponse: SurveyQuestionResponse
  onResponseChange: (newResponse: SurveyQuestionResponse) => void
}) => {
  const onClickOption = (option: string) => {
    onResponseChange({
      ...currentResponse,
      options: [option]
    })
  }

  const onCommentBoxChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    onResponseChange({
      ...currentResponse,
      comments: event.target.value
    })
  }

  return (
    <div>
      <Heading variant="h4">{question.question}</Heading>
      {question.options
        ? question.options.map(option => (
            <CheckboxInput
              key={option}
              onChange={() => onClickOption(option)}
              label={option}
              value={
                currentResponse.options
                  ? currentResponse.options.includes(option)
                  : false
              }
            />
          ))
        : null}
      {question.commentsTitle ? (
        <Heading variant="h5" noTopMargin>
          {question.commentsTitle}
        </Heading>
      ) : null}
      {question.allowComments !== false ? (
        <TextInput
          fullWidth
          rows={2}
          value={currentResponse.comments}
          onChange={onCommentBoxChange}
        />
      ) : null}
    </div>
  )
}

const finalCommentsQuestion = 'Additional comments'

const SurveyForm = ({
  survey,
  parentTable,
  parentId
}: {
  survey: Survey
  parentTable: string
  parentId: string
}) => {
  const [questionResponses, setQuestionResponses] = useState<
    SurveyQuestionResponse[]
  >([])
  const [isCreating, isSuccess, isErrored, create, clear] = useDataStoreCreate(
    CollectionNames.SurveyResponses
  )

  const onSubmitBtnClick = async () => {
    const surveyResponseRecord: SurveyResponse = {
      parenttable: parentTable,
      parent: parentId,
      questionresponses: questionResponses
    }

    create(surveyResponseRecord)
  }

  const onQuestionChange = (newResponse: SurveyQuestionResponse) => {
    setQuestionResponses(currentResponses =>
      currentResponses.find(
        currentResponse =>
          currentResponse.originalQuestion === newResponse.originalQuestion
      )
        ? currentResponses.map(currentResponse =>
            currentResponse.originalQuestion === newResponse.originalQuestion
              ? newResponse
              : currentResponse
          )
        : currentResponses.concat([newResponse])
    )
  }

  return (
    <Paper>
      <Heading variant="h3" align="center" noTopMargin>
        Survey "{survey.title}"
      </Heading>
      {isCreating ? (
        <LoadingIndicator />
      ) : isSuccess ? (
        <SuccessMessage>
          Your survey response has been sent! Thank you!
        </SuccessMessage>
      ) : isErrored ? (
        <ErrorMessage>
          Something screwed up on our end. If you like, you can submit your
          response in our Discord server in the #feedback section by pasting
          this in there:
          <textarea>{JSON.stringify(questionResponses, null, '  ')}</textarea>
        </ErrorMessage>
      ) : (
        <>
          {survey.questions.map(question => (
            <Question
              key={question.question}
              question={question}
              currentResponse={
                questionResponses.find(
                  currentResponse =>
                    currentResponse.originalQuestion === question.question
                ) || {
                  originalQuestion: question.question,
                  options: [],
                  comments: ''
                }
              }
              onResponseChange={onQuestionChange}
            />
          ))}
          {survey.allowFinalComments ? (
            <Question
              question={{ question: finalCommentsQuestion }}
              currentResponse={
                questionResponses.find(
                  questionResponse =>
                    questionResponse.originalQuestion === finalCommentsQuestion
                ) || { originalQuestion: finalCommentsQuestion }
              }
              onResponseChange={onQuestionChange}
            />
          ) : null}
          <FormControls>
            <Button onClick={onSubmitBtnClick} size="large">
              Submit
            </Button>
          </FormControls>
        </>
      )}
    </Paper>
  )
}

export default SurveyForm
