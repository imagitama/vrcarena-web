import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'

import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import { CommonMetaRecordFields, CommonRecordFields } from '../../data-store'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'

import Button from '../button'
import TextInput from '../text-input'
import LoadingIndicator from '../loading-indicator'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import FormControls from '../form-controls'
import { MetaRecord } from '../../modules/common'
import ErrorMessage from '../error-message'

const useStyles = makeStyles({
  label: {
    fontSize: '75%',
    display: 'block',
  },
})

const PublicEditorNotesForm = ({
  id,
  metaCollectionName,
  existingEditorNotes = undefined,
  onClick = undefined,
  onDone = undefined,
}: {
  id: string
  metaCollectionName: string
  existingEditorNotes?: string
  onClick?: (result: { editorNotes: string }) => void
  onDone?: () => void
}) => {
  const [isLoadingMeta, lastErrorCodeLoadingMeta, metaRecord] =
    useDataStoreItem<CommonMetaRecordFields>(
      metaCollectionName,
      existingEditorNotes !== undefined ? false : id,
      { queryName: 'editor-notes-form' }
    )
  const [isSaving, , lastErrorCodeSavingMeta, saveMetaRecord] =
    useDataStoreEdit<MetaRecord>(metaCollectionName, id)

  const [newEditorNotes, setNewEditorNotes] = useState(
    existingEditorNotes || ''
  )
  const classes = useStyles()

  useEffect(() => {
    if (!metaRecord || existingEditorNotes) {
      return
    }

    setNewEditorNotes(metaRecord.editornotes)
  }, [metaRecord !== null])

  if (
    isLoadingMeta ||
    isSaving ||
    (existingEditorNotes === undefined && !metaRecord)
  ) {
    return (
      <LoadingIndicator
        message={
          isLoadingMeta || !metaRecord ? 'Loading notes...' : 'Saving notes...'
        }
      />
    )
  }

  if (lastErrorCodeLoadingMeta !== null) {
    return (
      <ErrorMessage>
        Failed to load meta (code {lastErrorCodeLoadingMeta})
      </ErrorMessage>
    )
  }

  if (lastErrorCodeSavingMeta !== null) {
    return (
      <ErrorMessage>
        Failed to save meta (code {lastErrorCodeSavingMeta})
      </ErrorMessage>
    )
  }

  const onSaveBtnClick = async () => {
    try {
      if (onClick) {
        onClick({ editorNotes: newEditorNotes })
      }

      await saveMetaRecord({
        editornotes: newEditorNotes || '',
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to edit asset with editor notes', err)
      handleError(err)
    }
  }

  return (
    <>
      <span className={classes.label}>Public notes from editors:</span>
      <TextInput
        multiline
        minRows={2}
        value={newEditorNotes}
        onChange={(e) => setNewEditorNotes(e.target.value)}
      />
      <FormControls>
        <Button onClick={onSaveBtnClick} size="small" icon={<SaveIcon />}>
          Save Notes
        </Button>
      </FormControls>
    </>
  )
}

export default PublicEditorNotesForm
