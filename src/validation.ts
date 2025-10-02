import { EditableField, TextEditableField } from './editable-fields'
import { fieldTypes } from './generic-forms'
import { getIsUrl } from './utils'

export interface ValidationIssue {
  fieldName: string
  reason: ValidationReason
}

export enum ValidationReason {
  BelowMinLength,
  AboveMaxLength,
  Empty,
  NotUrl,
}

export const getValidationIssues = <TRecord extends object>(
  fields: TRecord,
  editableFields: EditableField<any>[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = []

  for (const fieldName in fields) {
    const editableField = editableFields.find(
      (field) => field.name === fieldName
    )
    const fieldValue = fields[fieldName]

    if (editableField) {
      if (
        editableField.isRequired &&
        (fieldValue === null || fieldValue === undefined || fieldValue === '')
      ) {
        issues.push({
          fieldName,
          reason: ValidationReason.Empty,
        })
      }

      if (
        (editableField as TextEditableField<any>).minLength !== undefined &&
        (fieldValue as string).length <
          (editableField as TextEditableField<any>).minLength
      ) {
        issues.push({
          fieldName,
          reason: ValidationReason.BelowMinLength,
        })
      }

      if (
        (editableField as TextEditableField<any>).maxLength !== undefined &&
        (fieldValue as string).length >
          (editableField as TextEditableField<any>).maxLength
      ) {
        issues.push({
          fieldName,
          reason: ValidationReason.AboveMaxLength,
        })
      }

      if (
        editableField.type === fieldTypes.url &&
        fieldValue &&
        !getIsUrl(fieldValue)
      ) {
        issues.push({
          fieldName,
          reason: ValidationReason.NotUrl,
        })
      }
    }
  }

  return issues
}
