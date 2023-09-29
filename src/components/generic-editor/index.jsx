import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDataStoreItem from '../../hooks/useDataStoreItem'
import useUserId from '../../hooks/useUserId'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import editableFields from '../../editable-fields'
import { fieldTypes } from '../../generic-forms'
import { trackAction } from '../../analytics'
import { scrollToTop, createRef } from '../../utils'
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
import { CommonFieldNames } from '../../data-store'

function getInputForFieldType(type) {
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

const getHiddenFieldsForDb = fields => {
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

const validateFields = (newFields, fieldDefinitions) => {
  for (const fieldDef of fieldDefinitions) {
    if (fieldDef.isRequired) {
      if (!newFields[fieldDef.name]) {
        return false
      }
    }
  }
  return true
}

export default ({
  collectionName,
  viewName,
  id = null,
  analyticsCategory = '',
  saveBtnAction = '',
  viewBtnAction = '',
  cancelBtnAction = '',
  successUrl = '',
  cancelUrl = '',
  extraFormData = {},
  getSuccessUrl = () => '',
  // amendments
  overrideFields = null,
  onFieldChanged = undefined
}) => {
  if (!(collectionName in editableFields)) {
    throw new Error(`Collection name ${collectionName} not in editable fields!`)
  }

  const fields = editableFields[collectionName]

  const [isLoading, isErrored, result] = useDataStoreItem(
    viewName || collectionName,
    id,
    `generic-editor-${viewName || collectionName}`
  )
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    collectionName,
    id
  )
  const [formFields, setFormFields] = useState(
    overrideFields
      ? overrideFields
      : id
      ? null
      : fields.reduce((newFormFields, fieldConfig) => {
          return {
            ...newFormFields,
            [fieldConfig.name]: fieldConfig.default
          }
        }, {})
  )
  const classes = useStyles()
  const [createdDocId, setCreatedDocId] = useState(null)
  const [isInvalid, setIsInvalid] = useState(false)

  useEffect(() => {
    if (!result) {
      return
    }

    setFormFields(
      fields.reduce((newFormFields, fieldConfig) => {
        return {
          ...newFormFields,
          [fieldConfig.name]:
            result[fieldConfig.name] === false
              ? false
              : result[fieldConfig.name] || fieldConfig.default
        }
      }, {})
    )
  }, [result === null])

  const onFieldChange = (name, newVal) => {
    if (onFieldChanged) {
      onFieldChanged(name, newVal)
    }

    setFormFields({
      ...formFields,
      [name]: newVal
    })
    setIsInvalid(false)
  }

  const onFieldsChange = updates => {
    setFormFields({
      ...formFields,
      ...updates
    })
    setIsInvalid(false)
  }

  const onSaveBtnClick = async () => {
    try {
      trackAction(analyticsCategory, saveBtnAction, id)

      scrollToTop()

      if (!validateFields(formFields, fields)) {
        setIsInvalid(true)
        return
      }

      const [newId] = await save({
        ...formFields,
        ...getHiddenFieldsForDb(fields)
      })

      setCreatedDocId(newId)
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
        <br />
        <br />
        <Button
          url={id ? successUrl : getSuccessUrl(createdDocId)}
          onClick={() => trackAction(analyticsCategory, viewBtnAction, id)}>
          View
        </Button>
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

      {fields
        .filter(({ type }) => type !== fieldTypes.hidden)
        .map(({ name, type, default: defaultValue, label, hint, ...rest }) => {
          const Input = getInputForFieldType(type)

          return (
            <Field
              key={name}
              label={type !== fieldTypes.checkbox ? label : null}>
              <Input
                name={name}
                value={formFields[name]}
                defaultValue={defaultValue}
                label={label}
                {...rest}
                onChange={newVal => onFieldChange(name, newVal)}
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
