import React, { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'

import useDataStoreEdit from '../../hooks/useDataStoreEdit'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'

import { handleError } from '../../error-handling'
import { AccessStatus, MetaRecord } from '../../modules/common'
import { CollectionNames } from '../../modules/assets'
import Dialog from '../dialog'
import ErrorMessage from '../error-message'

const DeleteDraftButton = ({
  assetId,
  onDone = undefined,
}: {
  assetId: string
  onDone?: () => void
}) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSaving, , lastErrorCodeSaving, save, clear] =
    useDataStoreEdit<MetaRecord>(CollectionNames.AssetsMeta, assetId)

  if (isSaving) {
    return <LoadingIndicator message={'Saving...'} />
  }

  if (lastErrorCodeSaving !== null) {
    return (
      <ErrorMessage onOkay={clear}>
        Failed to save asset (code {lastErrorCodeSaving})
      </ErrorMessage>
    )
  }

  const performDelete = async () => {
    try {
      setIsConfirming(false)

      const result = await save({
        accessstatus: AccessStatus.Deleted,
      })

      if (!result.length) {
        return
      }

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save draft deleted status', err)
      handleError(err)
    }
  }

  const onClickTry = () => setIsConfirming(true)

  return (
    <>
      {isConfirming && (
        <Dialog onClose={() => setIsConfirming(false)}>
          Are you sure you want to delete this draft?
          <Button onClick={performDelete}>Yes</Button>{' '}
          <Button color="secondary" onClick={() => setIsConfirming(false)}>
            No
          </Button>
        </Dialog>
      )}
      <Button onClick={onClickTry} icon={<DeleteIcon />} color="secondary">
        Delete Your Draft
      </Button>
    </>
  )
}

export default DeleteDraftButton
