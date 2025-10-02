import React from 'react'
import { EditableField } from '@/editable-fields'
import { ValidationIssue, ValidationReason } from '@/validation'
import ErrorMessage from '../error-message'

const getTextForIssue = (issue: ValidationIssue): string => {
  switch (issue.reason) {
    case ValidationReason.Empty:
      return 'is empty'
    case ValidationReason.BelowMinLength:
      return 'is not long enough'
    case ValidationReason.AboveMaxLength:
      return 'is too long'
    case ValidationReason.NotUrl:
      return 'is not a valid URL'
    default:
      throw new Error(`Unknown reason: ${issue.reason}`)
  }
}

const ValidationIssuesMessage = ({
  issues,
  editableFields,
  itemTypeSingular = 'record',
}: {
  issues: ValidationIssue[]
  editableFields: EditableField<any>[]
  itemTypeSingular?: string
}) => {
  return (
    <ErrorMessage title="Validation Issues">
      There were validation issues that prevented the{' '}
      {itemTypeSingular.toLowerCase()} from being saved:
      <ul>
        {issues.map((issue) => (
          <li key={issue.fieldName}>
            {
              editableFields.find((field) => field.name === issue.fieldName)!
                .label
            }{' '}
            {getTextForIssue(issue)}
          </li>
        ))}
      </ul>
    </ErrorMessage>
  )
}

export default ValidationIssuesMessage
