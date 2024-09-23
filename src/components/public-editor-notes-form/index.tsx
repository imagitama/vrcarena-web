import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import {
  CommonMetaFieldNames,
  CommonMetaRecordFields,
  CommonRecordFields,
} from '../../data-store'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'

import Button from '../button'
import TextInput from '../text-input'
import LoadingIndicator from '../loading-indicator'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import FormControls from '../form-controls'

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
  const [isLoadingMeta, isErroredLoadingMeta, metaRecord] =
    useDataStoreItem<CommonMetaRecordFields>(
      metaCollectionName,
      existingEditorNotes !== undefined ? false : id,
      'editor-notes-form'
    )
  const [isSaving, , isErroredSavingAsset, saveMetaRecord] = useDatabaseSave(
    metaCollectionName,
    id
  )

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
        message={isLoadingMeta || !metaRecord ? 'Loading...' : 'Saving...'}
      />
    )
  }

  if (isErroredLoadingMeta) {
    return <>Failed to load meta!</>
  }

  if (isErroredSavingAsset) {
    return <>Failed to save meta!</>
  }

  const onSaveBtnClick = async () => {
    try {
      if (onClick) {
        onClick({ editorNotes: newEditorNotes })
      }

      await saveMetaRecord({
        [CommonMetaFieldNames.editorNotes]: newEditorNotes || '',
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
        rows={2}
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
