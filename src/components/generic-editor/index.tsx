import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'

import useDataStoreItem from '../../hooks/useDataStoreItem'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'

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
import CustomInput from './components/custom-input'
import TagsInput from './components/tags-input'
import DropdownInput from './components/dropdown-input'
import ItemInput from './components/item-input'
import Tabs from '../tabs'
import DateInput from './components/date-input'
import UrlInput from '../url-input'

export type GenericInputProps = {
  name: string
  label?: string
  value: any
  defaultValue: any
  onChange: (newVal: any) => void
  extraFormData: any
  setFieldsValues: (updates: Record<string, any>) => void
  databaseResult: any
  formFields: any
}

// TODO: better type safety here
type GenericInput = (props: any) => JSX.Element

function getInputForFieldType(type: keyof typeof fieldTypes): GenericInput {
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
    case fieldTypes.dropdown:
      return DropdownInput
    case fieldTypes.item:
      return ItemInput
    case fieldTypes.url:
      return UrlInput
    default:
      throw new Error(`Invalid field type "${type}"`)
  }
}

const useStyles = makeStyles({
  saveBtn: {
    textAlign: 'center',
    marginTop: '1rem',
  },
  hint: {
    fontSize: '75%',
    fontStyle: 'italic',
    marginTop: '5px',
  },
})

const getHiddenFieldsForDb = (fields: EditableField<any>[]) => {
  const hiddenFields = fields.filter(({ type }) => type === fieldTypes.hidden)

  if (!hiddenFields.length) {
    return {}
  }

  return hiddenFields.reduce(
    (newObj, fieldData) => ({
      ...newObj,
      [fieldData.name]: fieldData.default,
    }),
    {}
  )
}

const validateFields = (
  newFields: Record<string, any>,
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

const GenericEditor = ({
  fields = undefined,
  collectionName,
  viewName = '',
  id = null,
  analyticsCategory = '',
  saveBtnAction = 'Click save button',
  cancelBtnAction = 'Click cancel button',
  successUrl = '',
  cancelUrl = '',
  extraFormData = {},
  getSuccessUrl = undefined,
  // amendments
  overrideFields = null,
  onFieldChanged = undefined,
  // asset editor mini
  isAccordion = false,
  onDone = undefined,
  saveBtnRecordType = '',
}: {
  fields?: EditableField<any>[]
  collectionName: string
  viewName?: string
  id?: string | null
  analyticsCategory?: string
  saveBtnAction?: string
  cancelBtnAction?: string
  successUrl?: string
  cancelUrl?: string
  extraFormData?: Object
  getSuccessUrl?: (newId: string | null) => string
  overrideFields?: Record<string, any> | null
  onFieldChanged?: (fieldName: string, newValue: any) => void
  // asset editor mini
  isAccordion?: boolean
  onDone?: () => void
  saveBtnRecordType?: string
}) => {
  if (!fields && !(collectionName in editableFields)) {
    throw new Error(`Collection name ${collectionName} not in editable fields!`)
  }

  const fieldsToUse = fields || editableFields[collectionName]

  const [isLoading, lastErrorCode, rawRecord] = useDataStoreItem<
    Record<string, any>
  >(viewName || collectionName, id || false, {
    queryName: `generic-editor-${viewName || collectionName}`,
  })
  const [isSaving, isSuccess, lastErrorCodeSaving, save, clear, updatedRecord] =
    useDataStoreEdit<Record<string, any>>(collectionName, id || false)
  const [formFields, setFormFields] = useState<null | Record<string, any>>(
    overrideFields
      ? overrideFields
      : id
      ? null
      : fieldsToUse.reduce((newFormFields, fieldConfig) => {
          return {
            ...newFormFields,
            [fieldConfig.name]: fieldConfig.default,
          }
        }, {})
  )
  const classes = useStyles()
  const [isInvalid, setIsInvalid] = useState(false)

  useEffect(() => {
    if (!rawRecord) {
      return
    }

    setFormFields(
      fieldsToUse.reduce((newFormFields, fieldConfig) => {
        return {
          ...newFormFields,
          [fieldConfig.name]:
            rawRecord[fieldConfig.name as string] === false
              ? false
              : (fieldConfig.name as string) in rawRecord
              ? rawRecord[fieldConfig.name as string]
              : fieldConfig.default,
        }
      }, {})
    )
  }, [rawRecord === null])

  const onFieldChange = (name: string, newVal: string | boolean | number) => {
    if (onFieldChanged) {
      onFieldChanged(name, newVal)
    }

    if (!formFields) {
      return
    }

    setFormFields({
      ...formFields,
      [name]: newVal,
    })
    setIsInvalid(false)
  }

  const onFieldsChange = (updates: Record<string, any>) => {
    setFormFields({
      ...formFields,
      ...updates,
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

      await save({
        ...formFields,
        ...getHiddenFieldsForDb(fieldsToUse),
      })

      if (onDone) {
        onDone()
      }
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

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load item to edit (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (lastErrorCodeSaving !== null) {
    return (
      <ErrorMessage>Failed to save (code {lastErrorCodeSaving})</ErrorMessage>
    )
  }

  if (isSuccess) {
    return (
      <SuccessMessage
        viewRecordUrl={
          getSuccessUrl && updatedRecord
            ? getSuccessUrl(updatedRecord.id)
            : successUrl
        }>
        The record has been saved
      </SuccessMessage>
    )
  }

  const fieldsBySection =
    fieldsToUse[0].section !== undefined
      ? fieldsToUse.reduce<{ [sectionName: string]: EditableField<any>[] }>(
          (newFieldsBySection, field) => {
            if (!field.section) {
              throw new Error(
                `Sections enabled but field ${
                  field.name as string
                } does not have a section`
              )
            }

            return {
              ...newFieldsBySection,
              [field.section]:
                field.section in newFieldsBySection
                  ? newFieldsBySection[field.section].concat([field])
                  : [field],
            }
          },
          {}
        )
      : undefined

  const mapEditableFieldToFieldOutput = ({
    name,
    type,
    default: defaultValue,
    label,
    hint,
    ...rest
  }: EditableField<any>) => {
    const Input = getInputForFieldType(type)

    return (
      <Field
        key={name as string}
        label={
          type !== fieldTypes.checkbox || rest.alwaysShowLabel
            ? label!
            : '(no label)'
        }
        // for mini editor
        isAccordion={isAccordion}>
        <Input
          name={name.toString()}
          value={formFields[name as string]}
          defaultValue={defaultValue}
          label={label}
          {...rest}
          onChange={(newVal: any) => onFieldChange(name.toString(), newVal)}
          // @ts-ignore
          extraFormData={extraFormData}
          setFieldsValues={onFieldsChange}
          databaseResult={rawRecord}
          // for mini editor
          formFields={formFields}
        />
        {hint && <div className={classes.hint}>{hint}</div>}
      </Field>
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

      {fieldsBySection ? (
        <Tabs
          items={Object.entries(fieldsBySection).map(
            ([sectionName, fields]) => ({
              name: sectionName,
              label: sectionName,
              contents: <div>{fields.map(mapEditableFieldToFieldOutput)}</div>,
            })
          )}
        />
      ) : (
        fieldsToUse
          .filter(({ type }) => type !== fieldTypes.hidden)
          .filter(({ isEditable }) =>
            id ? (isEditable !== false ? true : false) : true
          )
          .map(mapEditableFieldToFieldOutput)
      )}
      {onFieldChanged ? null : (
        <div className={classes.saveBtn}>
          {cancelUrl && (
            <Button
              url={cancelUrl}
              color="secondary"
              onClick={() => {
                trackAction(analyticsCategory, cancelBtnAction, id)
              }}>
              Cancel
            </Button>
          )}
          <Button
            onClick={onSaveBtnClick}
            icon={id ? <SaveIcon /> : <AddIcon />}>
            {id ? 'Save' : 'Create'} {saveBtnRecordType}
          </Button>
        </div>
      )}
    </>
  )
}

export default GenericEditor
