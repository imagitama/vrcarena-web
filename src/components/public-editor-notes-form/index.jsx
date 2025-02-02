import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CommonMetaFieldNames } from '../../data-store'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'

import Button from '../button'
import TextInput from '../text-input'
import LoadingIndicator from '../loading-indicator'
import useDataStoreItem from '../../hooks/useDataStoreItem'

const useStyles = makeStyles({
  label: {
    fontSize: '75%',
    display: 'block',
  },
})

export default ({
  id,
  metaCollectionName,
  existingEditorNotes = undefined,
  onClick = null,
  onDone = null,
}) => {
  const [isLoadingMeta, isErroredLoadingMeta, metaRecord] = useDataStoreItem(
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

    setNewEditorNotes(metaRecord[CommonMetaFieldNames.editorNotes])
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
        minRows={2}
        value={newEditorNotes}
        onChange={(e) => setNewEditorNotes(e.target.value)}
      />
      <Button onClick={onSaveBtnClick} size="small">
        Save
      </Button>
    </>
  )
}
