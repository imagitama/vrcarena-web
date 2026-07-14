import React, { useState, useEffect, useRef, Suspense } from 'react'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'

import editableFields, { EditableField } from '@/editable-fields'
import { fieldTypes } from '@/generic-forms'
import { trackAction } from '@/analytics'
import { scrollToElement, scrollToTop } from '@/utils'
import { handleError } from '@/error-handling'
import { ValidationIssue, getValidationIssues } from '@/validation'

import useDataStoreItem from '@/hooks/useDataStoreItem'
import useDataStoreEditOrCreate from '@/hooks/useDataStoreEditOrCreate'

import Button from '@/components/button'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import SuccessMessage from '@/components/success-message'
import Tabs from '@/components/tabs'
import UrlInput from '@/components/url-input'
import ValidationIssuesMessage from '@/components/validation-issues-message'
import FormControls from '@/components/form-controls'

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
import DateInput from './components/date-input'
import DateRangeInput from './components/date-range-input'
import { GenericInput } from './types'

function getInputForFieldType<TRecord extends Record<string, any>>(
  type: keyof typeof fieldTypes
): GenericInput<any, TRecord> {
  switch (type) {
    case fieldTypes.text:
      // @ts-ignore
      return TextInput
    case fieldTypes.textMarkdown:
      // @ts-ignore
      return TextMarkdownInput
    case fieldTypes.checkbox:
      // @ts-ignore
      return CheckboxInput
    case fieldTypes.multichoice:
      // @ts-ignore
      return MultichoiceInput
    case fieldTypes.imageUpload:
      // @ts-ignore
      return ImageUploadInput
    case fieldTypes.searchable:
      // @ts-ignore
      return SearchableInput
    case fieldTypes.singlechoice:
      // @ts-ignore
      return SinglechoiceInput
    case fieldTypes.date:
      return DateInput
    case fieldTypes.dateRange:
      // @ts-ignore
      return DateRangeInput
    case fieldTypes.assets:
      return AssetsInput
    case fieldTypes.custom:
      // @ts-ignore
      return CustomInput
    case fieldTypes.tags:
      // @ts-ignore
      return TagsInput
    case fieldTypes.dropdown:
      // @ts-ignore
      return DropdownInput
    case fieldTypes.item:
      // @ts-ignore
      return ItemInput
    case fieldTypes.url:
      return UrlInput
    default:
      throw new Error(`Invalid field type "${type}"`)
  }
}

const getHiddenFieldsForDb = (fields: EditableField<any>[]) => {
  const hiddenFields = fields.filter(
    ({ type, default: defaultVal }) => type === fieldTypes.hidden && defaultVal
  )

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

const GenericEditor = <TRecord extends Record<string, any>>({
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
  onFieldsChanged = undefined,
  // asset editor mini
  isAccordion = false,
  startExpanded = false,
  onDone = undefined,
  itemTypeSingular = '',
  showTopSaveBtn = false,
  scrollToTopOfEditor = false,
  scrollDisabled = false,
  onAttemptSave = undefined,
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
  overrideFields?: Partial<TRecord> | null
  onFieldChanged?: (fieldName: string, newValue: any) => void
  onFieldsChanged?: (fields: TRecord) => void
  // asset editor mini
  isAccordion?: boolean
  startExpanded?: boolean
  onDone?: () => void
  itemTypeSingular?: string
  showTopSaveBtn?: boolean
  scrollToTopOfEditor?: boolean
  scrollDisabled?: boolean
  onAttemptSave?: () => void
}) => {
  if (!fields && !(collectionName in editableFields)) {
    throw new Error(`Collection name ${collectionName} not in editable fields`)
  }

  const editableFieldsToUse = fields || editableFields[collectionName]

  const [isLoading, lastErrorCode, rawRecord] = useDataStoreItem<TRecord>(
    viewName || collectionName,
    id || false,
    {
      queryName: `generic-editor-${viewName || collectionName}`,
    }
  )
  const [isSaving, isSuccess, lastErrorCodeSaving, save, , updatedRecord] =
    useDataStoreEditOrCreate<TRecord>(collectionName, id || false)

  const [formFields, setFormFields] = useState<null | Partial<TRecord>>(
    overrideFields
      ? overrideFields
      : id
      ? null
      : editableFieldsToUse.reduce((newFormFields, fieldConfig) => {
          return {
            ...newFormFields,
            [fieldConfig.name]: fieldConfig.default,
          }
        }, {} as TRecord)
  )
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(
    []
  )
  const rootElementRef = useRef<HTMLDivElement>(null)

  console.debug(`GenericEditor.render`, formFields)

  useEffect(() => {
    if (!rawRecord) {
      return
    }

    setFormFields(
      editableFieldsToUse.reduce((newFormFields, fieldConfig) => {
        return {
          ...newFormFields,
          [fieldConfig.name]:
            rawRecord[fieldConfig.name as string] === false
              ? false
              : (fieldConfig.name as string) in rawRecord
              ? rawRecord[fieldConfig.name as string]
              : fieldConfig.default,
        }
      }, {} as TRecord)
    )
  }, [rawRecord === null])

  const onFieldChange = (
    name: string,
    newVal: string | boolean | number | null
  ) => {
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
  }

  const onFieldsChange = (updates: TRecord) => {
    console.debug('onFieldsChange', updates)
    setFormFields({
      ...formFields,
      ...updates,
    })
  }

  const onSaveBtnClick = async () => {
    try {
      console.debug('on click save button')

      if (analyticsCategory) {
        trackAction(analyticsCategory, saveBtnAction, id)
      }

      if (!formFields) {
        console.warn('stopping save/create - no form fields')
        return
      }

      if (scrollDisabled !== true) {
        if (scrollToTopOfEditor) {
          scrollToElement(rootElementRef.current!)
        } else {
          scrollToTop()
        }
      }

      if (onAttemptSave) {
        onAttemptSave()
      }

      const newValidationIssues = getValidationIssues(
        formFields,
        editableFieldsToUse
      )

      if (newValidationIssues.length) {
        console.warn(
          `stopping save/create - validation issues:`,
          newValidationIssues
        )
        setValidationIssues(newValidationIssues)
        return
      } else {
        setValidationIssues([])
      }

      console.debug(`performing save...`)

      const result = await save({
        ...formFields,
        ...getHiddenFieldsForDb(editableFieldsToUse),
      })

      if (!result) {
        console.debug('result is empty')
        return
      }

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(`Failed to save ${id} to ${collectionName}`, err)
      handleError(err)
    }
  }

  if (!formFields) {
    return <LoadingIndicator message={'Waiting for fields...'} />
  }

  const fieldsBySection =
    editableFieldsToUse[0].section !== undefined
      ? editableFieldsToUse.reduce<{
          [sectionName: string]: EditableField<any>[]
        }>((newFieldsBySection, field) => {
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
        }, {})
      : undefined

  const mapEditableFieldToFieldOutput = (editableField: EditableField<any>) => {
    const Input = getInputForFieldType(editableField.type)

    return (
      <Suspense fallback={<LoadingIndicator message="Loading field..." />}>
        <Field
          key={editableField.name as string}
          editableField={editableField}
          // for mini editor
          isAccordion={isAccordion}
          startExpanded={startExpanded}>
          <Input
            editableField={editableField}
            value={formFields[editableField.name as string]}
            onChange={(newVal: any) =>
              onFieldChange(editableField.name as string, newVal)
            }
            extraFormData={extraFormData}
            setFieldsValues={
              onFieldsChange as (updates: Partial<Record<string, any>>) => void
            }
            databaseResult={rawRecord}
            // for mini editor
            formFields={formFields}
          />
        </Field>
      </Suspense>
    )
  }

  const controls = (
    <FormControls>
      <Button
        onClick={onSaveBtnClick}
        icon={id ? <SaveIcon /> : <AddIcon />}
        size="large">
        {id ? 'Save' : 'Create'} {itemTypeSingular}
      </Button>
      {cancelUrl && (
        <Button
          url={cancelUrl}
          color="secondary"
          size="large"
          onClick={() => {
            trackAction(analyticsCategory, cancelBtnAction, id)
          }}>
          Cancel
        </Button>
      )}
    </FormControls>
  )

  return (
    <div ref={rootElementRef}>
      {isLoading || !formFields || isSaving ? (
        <LoadingIndicator
          message={
            isSaving
              ? 'Saving...'
              : !formFields
              ? 'Waiting for fields...'
              : isLoading
              ? 'Loading data...'
              : 'Loading editor...'
          }
        />
      ) : null}

      {lastErrorCode !== null ? (
        <ErrorMessage>Failed to load (code {lastErrorCode})</ErrorMessage>
      ) : null}

      {lastErrorCodeSaving !== null ? (
        <ErrorMessage>
          Failed to save {itemTypeSingular} (code {lastErrorCodeSaving})
        </ErrorMessage>
      ) : null}

      {isSuccess ? (
        <SuccessMessage
          viewRecordUrl={
            getSuccessUrl && updatedRecord
              ? getSuccessUrl(updatedRecord.id)
              : successUrl
          }>
          {itemTypeSingular ? `${itemTypeSingular} saved` : 'Saved'}{' '}
          successfully
        </SuccessMessage>
      ) : null}

      {validationIssues.length ? (
        <ValidationIssuesMessage
          issues={validationIssues}
          editableFields={editableFieldsToUse}
          itemTypeSingular={itemTypeSingular}
        />
      ) : null}

      {onFieldChanged || !showTopSaveBtn ? null : controls}

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
        editableFieldsToUse
          .filter(({ type }) => type !== fieldTypes.hidden)
          .filter(({ isEditable }) =>
            id ? (isEditable !== false ? true : false) : true
          )
          .map(mapEditableFieldToFieldOutput)
      )}
      {onFieldChanged ? null : controls}
    </div>
  )
}

export default GenericEditor
