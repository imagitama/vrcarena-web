import React, { useEffect, useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import useDataStoreEditOrCreate from '@/hooks/useDataStoreEditOrCreate'
import useUserId from '@/hooks/useUserId'
import { AssetNotes, CollectionNames } from '@/modules/asset-notes'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import Button from '../button'
import TextInput from '../text-input'
import ErrorMessage from '../error-message'
import Paper from '../paper'

const AssetNotesButton = ({ assetId }: { assetId: string }) => {
  const userId = useUserId()! // assume logged in to see this
  const ids = `${assetId}_${userId}`
  const [isSaving, , lastErrorCodeSaving, saveOrCreate] =
    useDataStoreEditOrCreate<AssetNotes>(CollectionNames.AssetNotes, ids, {
      idField: ['asset', 'createdby'],
    })
  const [isLoading, lastErrorCode, assetNotes, hydrate] =
    useDataStoreItem<AssetNotes>(CollectionNames.AssetNotes, ids, {
      idField: 'ids',
    })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [newNotes, setNewNotes] = useState('')

  useEffect(() => {
    if (!assetNotes) {
      return
    }
    setNewNotes(assetNotes.notes || '')
  }, [assetNotes && assetNotes.notes])

  const isBusy = isSaving || isLoading

  const onClickSave = async () => {
    try {
      const createdDoc = await saveOrCreate({
        asset: assetId,
        notes: newNotes,
        createdby: userId,
      })

      console.debug(`saved notes successfully`, createdDoc)

      setIsFormOpen(false)

      hydrate()
    } catch (err) {
      console.error(err)
    }
  }

  if (isFormOpen) {
    return (
      <>
        {lastErrorCodeSaving !== null ? (
          <ErrorMessage>
            Failed to save notes (code {lastErrorCodeSaving})
          </ErrorMessage>
        ) : null}
        <TextInput
          minRows={2}
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          isDisabled={isBusy}
          size="small"
          fullWidth
          onKeyDown={(e) => {
            if (e.key == 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onClickSave()
            }
          }}
        />
        <Button
          icon={<SaveIcon />}
          size="small"
          onClick={onClickSave}
          isDisabled={isBusy}>
          Save (or press Enter)
        </Button>
      </>
    )
  }

  return (
    <>
      {lastErrorCode ? (
        <ErrorMessage>Failed to load notes (code {lastErrorCode})</ErrorMessage>
      ) : null}
      {assetNotes ? <Paper margin>{assetNotes.notes}</Paper> : null}
      <Button
        icon={<NoteAddIcon />}
        color="secondary"
        onClick={() => setIsFormOpen(true)}
        isDisabled={isBusy}>
        Edit Your Notes
      </Button>
    </>
  )
}

export default AssetNotesButton
