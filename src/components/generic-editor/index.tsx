import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDataStoreItem from '../../hooks/useDataStoreItem'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import editableFields, { EditableField } from '../../editable-fields'
import { fieldTypes } from '../../generic-forms'
import { trackAction } from '../../analytics'
import { scrollToTop } from '../../utils'
import { handleError } from '../../error-handling'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'

import Field from './components/field'
import CheckboxInput from './components/checkbox-input'
import TextInput from './components/text-input'
import TextMarkdownInput from './components/text-markdown-input'
import MultichoiceInput from './components/multichoice-input'
import SinglechoiceInput from './components/singlechoice-input'
import ImageUploadInput from './components/image-upload-input'
import SearchableInput from './components/searchable-input'
import AssetsInput from './components/assets-input'
import DateInput from './components/date-input'
import CustomInput from './components/custom-input'
import TagsInput from './components/tags-input'

function getInputForFieldType(type: keyof typeof fieldTypes) {
  switch (type) {
    case fieldTypes.text:
      return TextInput
    case fieldTypes.textMarkdown:
      return TextMarkdownInput
    case fieldTypes.checkbox:
      return CheckboxInput
    case fieldTypes.multichoice:
      return MultichoiceInput
    case fieldTypes.imageUpload:
      return ImageUploadInput
    case fieldTypes.searchable:
      return SearchableInput
    case fieldTypes.singlechoice:
      return SinglechoiceInput
    case fieldTypes.date:
      return DateInput
    case fieldTypes.assets:
      return AssetsInput
    case fieldTypes.custom:
      return CustomInput
    case fieldTypes.tags:
      return TagsInput
    default:
      throw new Error(`Invalid field type "${type}"`)
  }
}

const useStyles = makeStyles({
  saveBtn: {
    textAlign: 'center',
    marginTop: '1rem'
  },
  hint: {
    fontSize: '75%',
    fontStyle: 'italic',
    marginTop: '5px'
  }
})

const getHiddenFieldsForDb = (fields: EditableField<any>[]) => {
  const hiddenFields = fields.filter(({ type }) => type === fieldTypes.hidden)

  if (!hiddenFields.length) {
    return {}
  }

  return hiddenFields.reduce(
    (newObj, fieldData) => ({
      ...newObj,
      [fieldData.name]: fieldData.default
    }),
    {}
  )
}

const validateFields = (
  newFields: Record,
  fieldDefinitions: EditableField<any>[]
): boolean => {
  for (const fieldDef of fieldDefinitions) {
    if (fieldDef.isRequired) {
      // TODO: Better required check - "false" is provided but would fail this
      if (!newFields[fieldDef.name.toString()]) {
        return false
      }
    }
  }
  return true
}

type Record = { [fieldName: string]: string | boolean | number }

export default ({
  fields = undefined,
  collectionName,
  viewName = '',
  id = null,
  analyticsCategory = '',
  saveBtnAction = 'Click save button',
  viewBtnAction = 'Click view item button after save',
  cancelBtnAction = 'Click cancel button',
  successUrl = '',
  cancelUrl = '',
  extraFormData = {},
  getSuccessUrl = undefined,
  // amendments
  overrideFields = null,
  onFieldChanged = undefined
}: {
  fields?: EditableField<any>[]
  collectionName: string
  viewName?: string
  id?: string | null
  analyticsCategory?: string
  saveBtnAction?: string
  viewBtnAction?: string
  cancelBtnAction?: string
  successUrl?: string
  cancelUrl?: string
  extraFormData?: Object
  getSuccessUrl?: (newId: string | null) => string
  overrideFields?: Record | null
  onFieldChanged?: (fieldName: string, newValue: any) => void
}) => {
  if (!fields && !(collectionName in editableFields)) {
    throw new Error(`Collection name ${collectionName} not in editable fields!`)
  }

  const fieldsToUse = fields || editableFields[collectionName]

  const [isLoading, isErrored, result] = useDataStoreItem<Record>(
    viewName || collectionName,
    id || false,
    `generic-editor-${viewName || collectionName}`
  )
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    collectionName,
    id
  )
  const [formFields, setFormFields] = useState<null | Record>(
    overrideFields
      ? overrideFields
      : id
      ? null
      : fieldsToUse.reduce((newFormFields, fieldConfig) => {
          return {
            ...newFormFields,
            [fieldConfig.name]: fieldConfig.default
          }
        }, {})
  )
  const classes = useStyles()
  const [createdDocId, setCreatedDocId] = useState<string | null>(null)
  const [isInvalid, setIsInvalid] = useState(false)

  useEffect(() => {
    if (!result) {
      return
    }

    setFormFields(
      fieldsToUse.reduce((newFormFields, fieldConfig) => {
        return {
          ...newFormFields,
          [fieldConfig.name]:
            result[fieldConfig.name.toString()] === false
              ? false
              : result[fieldConfig.name.toString()] || fieldConfig.default
        }
      }, {})
    )
  }, [result === null])

  const onFieldChange = (name: string, newVal: string | boolean | number) => {
    if (onFieldChanged) {
      onFieldChanged(name, newVal)
    }

    if (!formFields) {
      return
    }

    setFormFields({
      ...formFields,
      [name]: newVal
    })
    setIsInvalid(false)
  }

  const onFieldsChange = (updates: Record) => {
    setFormFields({
      ...formFields,
      ...updates
    })
    setIsInvalid(false)
  }

  const onSaveBtnClick = async () => {
    try {
      if (analyticsCategory) {
        trackAction(analyticsCategory, saveBtnAction, id)
      }

      if (!formFields) {
        console.warn('Cannot save - no form fields')
        return
      }

      scrollToTop()

      if (!validateFields(formFields, fieldsToUse)) {
        setIsInvalid(true)
        return
      }

      const [newDocument] = await save({
        ...formFields,
        ...getHiddenFieldsForDb(fieldsToUse)
      })

      setCreatedDocId(newDocument ? newDocument.id : null)
    } catch (err) {
      console.error(`Failed to save ${id} to ${collectionName}`, err)
      handleError(err)
    }
  }

  if (isLoading || !formFields || isSaving) {
    return (
      <LoadingIndicator
        message={
          isSaving
            ? 'Saving...'
            : !formFields
            ? 'Waiting for fields...'
            : isLoading
            ? 'Loading data...'
            : 'Loading...'
        }
      />
    )
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load item to edit</ErrorMessage>
  }

  if (isFailed) {
    return <ErrorMessage>Failed to save</ErrorMessage>
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        The record has been saved
        {getSuccessUrl || successUrl ? (
          <>
            <br />
            <br />
            <Button
              url={getSuccessUrl ? getSuccessUrl(createdDocId) : successUrl}
              onClick={() => {
                if (analyticsCategory) {
                  trackAction(analyticsCategory, viewBtnAction, id)
                }
              }}>
              View
            </Button>
          </>
        ) : null}
      </SuccessMessage>
    )
  }

  return (
    <>
      {isInvalid && (
        <ErrorMessage>
          One or more fields are invalid. Ensure the required fields have a
          value.
        </ErrorMessage>
      )}

      {fieldsToUse
        .filter(({ type }) => type !== fieldTypes.hidden)
        .filter(({ isEditable }) =>
          id ? (isEditable !== false ? true : false) : true
        )
        .map(({ name, type, default: defaultValue, label, hint, ...rest }) => {
          const Input = getInputForFieldType(type)

          return (
            <Field
              key={name.toString()}
              label={type !== fieldTypes.checkbox ? label : null}>
              <Input
                name={name.toString()}
                // @ts-ignore
                value={formFields[name]}
                defaultValue={defaultValue}
                label={label}
                {...rest}
                onChange={(newVal: any) =>
                  onFieldChange(name.toString(), newVal)
                }
                // @ts-ignore
                extraFormData={extraFormData}
                setFieldsValues={onFieldsChange}
                databaseResult={result}
              />
              {hint && <div className={classes.hint}>{hint}</div>}
            </Field>
          )
        })}
      {onFieldChanged ? null : (
        <div className={classes.saveBtn}>
          <Button
            url={cancelUrl}
            color="default"
            onClick={() => trackAction(analyticsCategory, cancelBtnAction, id)}>
            Cancel
          </Button>{' '}
          <Button onClick={onSaveBtnClick}>{id ? 'Save' : 'Create'}</Button>
        </div>
      )}
    </>
  )
}
