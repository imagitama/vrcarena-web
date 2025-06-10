import React, { useState } from 'react'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'
import { CollectionNames, QuestionFields } from '../../modules/questions'
import Button from '../button'
import CheckboxInput from '../checkbox-input'
import ErrorMessage from '../error-message'
import FormControls from '../form-controls'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import TextInput from '../text-input'
import { Question } from '../../modules/questions'
import { handleError } from '../../error-handling'
import InfoMessage from '../info-message'

const QuestionForm = ({
  assetId,
  onDone,
}: {
  assetId: string
  onDone: () => void
}) => {
  const [questionFields, setQuestionFields] = useState<QuestionFields>({
    asset: assetId,
    question: '',
    isoriginalcreator: false,
  })
  const [isCreating, isSuccess, lastErrorCode, create] =
    useDataStoreCreate<QuestionFields>(CollectionNames.Questions)

  const onSubmitBtnClick = async () => {
    try {
      await create({
        ...questionFields,
        asset: assetId,
      })

      onDone()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onFieldChange = (fieldName: keyof Question, value: any) =>
    setQuestionFields((currentVal) => ({
      ...currentVal,
      [fieldName]: value,
    }))

  return (
    <>
      {isCreating ? (
        <LoadingIndicator />
      ) : isSuccess ? (
        <SuccessMessage>Your question has been submitted</SuccessMessage>
      ) : lastErrorCode ? (
        <ErrorMessage>
          Failed to submit your question (code {lastErrorCode})
        </ErrorMessage>
      ) : null}
      <InfoMessage>
        Only use this form to ask important or frequently asked questions. Minor
        questions should be in a comment.
      </InfoMessage>
      <TextInput
        label="Question"
        value={questionFields.question}
        fullWidth
        multiline
        minRows={2}
        onChange={(e) => onFieldChange('question', e.target.value)}
        isDisabled={isCreating}
      />
      <CheckboxInput
        value={questionFields.isoriginalcreator}
        onChange={(newVal) => onFieldChange('isoriginalcreator', newVal)}
        label="I am the original creator of this asset (will be shown)"
        isDisabled={isCreating}
      />
      <FormControls>
        <Button onClick={onSubmitBtnClick} size="large" isDisabled={isCreating}>
          Submit Question
        </Button>
      </FormControls>
    </>
  )
}

export default QuestionForm
