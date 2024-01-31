import React, { useState } from 'react'
import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'
import {
  CollectionNames,
  FullQuestion,
  FullQuestionAnswer,
  QuestionAnswer,
  ViewNames,
} from '../../modules/questions'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import Button from '../button'
import QuestionForm from '../question-form'
import QuestionAnswerForm from '../question-answer-form'
import Paper from '../paper'
import FormControls from '../form-controls'
import UsernameLink from '../username-link'
import FormattedDate from '../formatted-date'

const Question = ({
  question,
  hydrate,
}: {
  question: FullQuestion
  hydrate: () => void
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false)
  return (
    <Paper>
      <strong>Question: {question.question}</strong>
      <br />
      Asked <FormattedDate date={question.createdat} /> by{' '}
      <UsernameLink
        username={question.createdbyusername}
        id={question.createdby}
      />
      {question.isoriginalcreator ? ' (original creator)' : ''}
      {question.answers.length
        ? question.answers.map((answer) => (
            <Answer key={answer.id} answer={answer} />
          ))
        : null}
      {isFormVisible ? (
        <>
          <br />
          <QuestionAnswerForm
            parentId={question.id}
            onDone={() => {
              setIsFormVisible(false)
              hydrate()
            }}
          />
        </>
      ) : (
        <>
          <FormControls>
            <Button onClick={() => setIsFormVisible(true)}>
              {question.answers.length
                ? 'Add Your Answer'
                : 'Be The First To Answer'}
            </Button>
          </FormControls>
        </>
      )}
    </Paper>
  )
}

const Answer = ({ answer }: { answer: FullQuestionAnswer }) => {
  return (
    <div style={{ margin: '0.5rem 0 0.5rem 1rem ' }}>
      <strong>Answer: {answer.answer}</strong>
      <br />
      Answered <FormattedDate date={answer.createdat} /> by{' '}
      <UsernameLink username={answer.createdbyusername} id={answer.createdby} />
      {answer.isoriginalcreator ? ' (original creator)' : ''}
      {answer.sourceurl ? (
        <>
          <br />
          Source: <a href={answer.sourceurl}>{answer.sourceurl}</a>
        </>
      ) : null}
    </div>
  )
}

const Questions = ({ assetId }: { assetId: string }) => {
  const [isLoading, isError, questions, hydrate] =
    useDatabaseQuery<FullQuestion>(ViewNames.GetPublicQuestions, [
      ['asset', Operators.EQUALS, assetId],
    ])
  const [isFormVisible, setIsFormVisible] = useState(false)

  if (isLoading || !Array.isArray(questions)) {
    return <LoadingIndicator message="Loading questions..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load questions</ErrorMessage>
  }

  const onClickAsk = () => setIsFormVisible((currentVal) => !currentVal)

  return (
    <>
      {questions.length ? (
        questions.map((question) => (
          <Question key={question.id} question={question} hydrate={hydrate} />
        ))
      ) : (
        <NoResultsMessage>No questions yet</NoResultsMessage>
      )}

      {isFormVisible ? (
        <QuestionForm
          assetId={assetId}
          onDone={() => {
            setIsFormVisible(false)
            hydrate()
          }}
        />
      ) : (
        <FormControls>
          <Button onClick={onClickAsk}>Ask Question</Button>
        </FormControls>
      )}
    </>
  )
}

export default Questions
