import React, { useState } from 'react'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'
import { CollectionNames, QuestionAnswerFields } from '../../modules/questions'
import Button from '../button'
import CheckboxInput from '../checkbox-input'
import ErrorMessage from '../error-message'
import FormControls from '../form-controls'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import TextInput from '../text-input'
import { handleError } from '../../error-handling'

const QuestionAnswerForm = ({
  parentId,
  onDone,
}: {
  parentId: string
  onDone: () => void
}) => {
  const [questionAnswerFields, setQuestionAnswerFields] =
    useState<QuestionAnswerFields>({
      parent: parentId,
      answer: '',
      sourceurl: '',
      isoriginalcreator: false,
    })
  const [isCreating, isSuccess, lastErrorCode, create] =
    useDataStoreCreate<QuestionAnswerFields>(CollectionNames.QuestionAnswers)

  const onSubmitBtnClick = async () => {
    try {
      await create({
        ...questionAnswerFields,
        parent: parentId,
      })

      onDone()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onFieldChange = (fieldName: keyof QuestionAnswerFields, value: any) =>
    setQuestionAnswerFields((currentVal) => ({
      ...currentVal,
      [fieldName]: value,
    }))

  return (
    <>
      {isCreating ? (
        <LoadingIndicator />
      ) : isSuccess ? (
        <SuccessMessage>Your answer has been submitted</SuccessMessage>
      ) : lastErrorCode !== null ? (
        <ErrorMessage>Failed to submit your answer</ErrorMessage>
      ) : null}
      <TextInput
        label="Answer"
        fullWidth
        value={questionAnswerFields.answer}
        onChange={(e) => onFieldChange('answer', e.target.value)}
        multiline
        minRows={2}
        isDisabled={isCreating}
      />
      <br />
      <br />
      <TextInput
        fullWidth
        label="Source URL"
        value={questionAnswerFields.sourceurl}
        onChange={(e) => onFieldChange('sourceurl', e.target.value)}
        isDisabled={isCreating}
      />
      <CheckboxInput
        value={questionAnswerFields.isoriginalcreator}
        onChange={(newVal) => onFieldChange('isoriginalcreator', newVal)}
        label="I am the original creator of this asset (will be shown)"
        isDisabled={isCreating}
      />
      <FormControls>
        <Button onClick={onSubmitBtnClick} size="large" isDisabled={isCreating}>
          Submit Answer
        </Button>
      </FormControls>
    </>
  )
}

export default QuestionAnswerForm
