import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'

import { CollectionNames as OldCollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import {
  getChangedFieldNames,
  mergeNewFieldsIntoParent,
} from '../../utils/amendments'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { getFieldNameAndValueForOutput } from '../../utils/assets'
import { CollectionNames } from '../../data-store'

import ErrorMessage from '../error-message'
import FormControls from '../form-controls'
import Button from '../button'
import AssetEditor, { EditorContext } from '../asset-editor'
import Message from '../message'
import TextInput from '../text-input'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import { AmendmentsFieldNames } from '../../modules/amendments'
import ShortDiff from '../short-diff'
import GenericEditor from '../generic-editor'
import WarningMessage from '../warning-message'
import Heading from '../heading'
import { Asset } from '../../modules/assets'
import useSupabaseClient from '../../hooks/useSupabaseClient'

const useStyles = makeStyles({
  cols: {
    display: 'flex',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '200%',
    marginBottom: '1rem',
  },
  thumbnail: {
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  field: {
    border: '1px solid rgba(255, 255, 255, 0.5)',
    padding: '0.5rem',
    marginBottom: '0.5rem',
    opacity: '0.5',
  },
  diff: {
    display: 'flex',
    '& > *': {
      width: '50%',
    },
  },
  changed: {
    border: '2px solid yellow',
    opacity: 1,
  },
  controls: {
    textAlign: 'center',
  },
  commentsField: {
    width: '100%',
  },
  fieldsChangedCount: {
    textAlign: 'center',
    fontSize: '150%',
    fontWeight: 'bold',
    padding: '0.5rem',
    color: 'rgb(255, 200, 200)',
  },
})

const ParentEditor = ({
  type,
  id,
  fields,
  onFieldChanged,
  insertExtraFields,
}: {
  type?: string
  id?: string
  fields: any
  onFieldChanged: (fieldName: string, value: any) => void
  insertExtraFields: (extraFields: { [fieldName: string]: any }) => void
}) => {
  switch (type) {
    case OldCollectionNames.Assets:
      return (
        <EditorContext.Provider
          // @ts-ignore
          value={{
            asset: fields,
            originalAssetId: id,
            onFieldChanged,
            insertExtraFields,
          }}>
          <AssetEditor />
        </EditorContext.Provider>
      )
    case OldCollectionNames.Authors:
      return (
        <GenericEditor
          collectionName={OldCollectionNames.Authors}
          id={id}
          overrideFields={{}}
          onFieldChanged={onFieldChanged}
        />
      )
    default:
      throw new Error(
        `Cannot render parent editor for type ${type} - unsupported`
      )
  }
}

const getViewNameForParentTable = (parentTable: string): string => {
  switch (parentTable) {
    case OldCollectionNames.Assets:
      return 'getfullassets'
    case OldCollectionNames.Authors:
      return 'getfullauthors'
    default:
      throw new Error(`Cannot get view name for parent "${parentTable}"`)
  }
}

const AmendmentEditor = ({
  amendmentId = undefined,
  parentTable = undefined,
  parentId = undefined,
  returnUrl = '',
}: {
  amendmentId?: string
  parentTable?: string
  parentId?: string
  returnUrl?: string
}) => {
  const classes = useStyles()
  const [isLoadingParent, isErroredLoadingParent, parent] =
    useDataStoreItem<any>(
      parentTable ? getViewNameForParentTable(parentTable) : '',
      parentId || false,
      'amendment-editor-parent'
    )
  const [isSaving, isSuccess, isErroredSaving, saveOrCreate] = useDatabaseSave(
    CollectionNames.Amendments,
    amendmentId
  )
  const [newFieldsForSaving, setNewFieldsForSaving] = useState({})
  const [newFieldsForOutput, setNewFieldsForOutput] = useState<{
    [fieldName: string]: any
  }>({})
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [comments, setComments] = useState('')
  const supabase = useSupabaseClient()

  if (isLoadingParent || !parent) {
    return <LoadingIndicator message="Loading parent..." />
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        Amendment {amendmentId ? 'saved' : 'created'} successfully
        <br />
        <br />
        Our editors have been notified of your pending amendment and will try to
        review it ASAP.
        <br />
        <br />
        Please ask in our Discord server if it has been several days without
        action.
        <br />
        <br />
        {returnUrl ? <Button url={returnUrl}>Return to Parent</Button> : null}
      </SuccessMessage>
    )
  }

  if (isErroredSaving) {
    return (
      <ErrorMessage>
        Failed to {amendmentId ? 'save' : 'create'} amendment
      </ErrorMessage>
    )
  }

  if (isErroredLoadingParent) {
    return (
      <ErrorMessage>
        Failed to load parent - are you sure it exists?
      </ErrorMessage>
    )
  }

  const onCreate = async () => {
    try {
      await saveOrCreate({
        [AmendmentsFieldNames.parentTable]: parentTable,
        [AmendmentsFieldNames.parent]: parentId,
        [AmendmentsFieldNames.fields]: newFieldsForSaving,
        [AmendmentsFieldNames.comments]: comments,
      })
    } catch (err) {
      console.error('Failed to save amendment', err)
      handleError(err)
    }
  }

  const onEdit = async () => {}

  const changedFieldNames = getChangedFieldNames(parent, newFieldsForOutput)

  // note: each little form does its own save so we override EVERY one with this func
  const onFieldChanged = async (fieldName: string, newValue: any) => {
    console.debug(`AmendmentEditor.onFieldChanged.${fieldName}`, newValue)

    // we store the data as IDs but still need to output it as "authorName" etc.
    const [outputFieldName, outputValue] = await getFieldNameAndValueForOutput(
      supabase,
      fieldName as keyof Asset,
      newValue
    )

    setNewFieldsForSaving((currentFields) => ({
      ...currentFields,
      [fieldName]: newValue,
    }))

    setNewFieldsForOutput((currentFields) => ({
      ...currentFields,
      [fieldName]: newValue,
      [outputFieldName]: outputValue,
    }))
  }

  const insertExtraFields = (extraFields: { [fieldName: string]: any }) => {
    console.debug(`AmendmentEditor.insertExtraFields`, { extraFields })

    // TODO: do this in generic way (quick fix)
    if (extraFields.attachmentsdata) {
      setNewFieldsForOutput((currentVal) => ({
        ...currentVal,
        attachmentsdata: currentVal.attachmentsdata
          ? currentVal.attachmentsdata.concat(extraFields.attachmentsdata)
          : extraFields.attachmentsdata,
      }))
      return
    }

    setNewFieldsForOutput((currentVal) => ({
      ...currentVal,
      ...extraFields,
    }))
  }

  const parentWithFieldsForOutput = mergeNewFieldsIntoParent(
    newFieldsForOutput,
    parent
  )

  console.debug(`AmendmentEditor.render`, { parentWithFieldsForOutput })

  if (isPreviewVisible) {
    return (
      <div>
        <WarningMessage>
          Please review ALL fields to ensure your amendment is correct before
          submitting it for approval
        </WarningMessage>
        <Heading variant="h2">Fields</Heading>
        <ShortDiff
          type={parentTable}
          oldFields={parent}
          newFields={parentWithFieldsForOutput}
          onlyNewFields={newFieldsForSaving}
        />
        <Heading variant="h2">Comments</Heading>
        <p>Why are you changing this asset? What is wrong with it?</p>
        <TextInput
          multiline
          minRows={5}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className={classes.commentsField}
        />
        <FormControls>
          {amendmentId ? (
            <Button onClick={onEdit} icon={<CheckIcon />} size={'large'}>
              Edit Amendment
            </Button>
          ) : (
            <Button onClick={onCreate} icon={<CheckIcon />} size={'large'}>
              Submit Amendment For Approval
            </Button>
          )}{' '}
          <Button
            onClick={() => setIsPreviewVisible(false)}
            size="large"
            color="default">
            Back to Editor
          </Button>
        </FormControls>
      </div>
    )
  } else {
    return (
      <>
        <Message>
          To proceed with your amendment you must click this button:
          <FormControls>
            <Button onClick={() => setIsPreviewVisible(true)} size="large">
              View Preview
            </Button>
          </FormControls>
        </Message>
        <ParentEditor
          type={parentTable}
          id={parentId}
          fields={parentWithFieldsForOutput}
          onFieldChanged={onFieldChanged}
          insertExtraFields={insertExtraFields}
        />
      </>
    )
  }
}

export default AmendmentEditor
