import React from 'react'
import Button from '../button'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import { handleError } from '../../error-handling'
import { AssetMeta, CollectionNames } from '../../modules/assets'
import useTimer from '../../hooks/useTimer'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'

const ClearIndicativeStatusButton = ({
  assetId,
  onDone,
}: {
  assetId: string
  onDone?: () => void
}) => {
  const [isSaving, isSavingSuccess, lastSavingErrorCode, save] =
    useDataStoreEdit<AssetMeta>(CollectionNames.AssetsMeta, assetId)
  const onDoneAfterDelay = useTimer(onDone)

  const onSaveClick = async () => {
    try {
      await save({
        indicativeauditstatus: null,
      })

      onDoneAfterDelay()
    } catch (err) {
      console.error('Failed to save asset meta', err)
      handleError(err)
    }
  }

  return (
    <>
      <Button color="secondary" onClick={onSaveClick} isLoading={isSaving}>
        Clear Status
      </Button>
      {isSavingSuccess ? (
        <SuccessMessage>
          Asset saved, refreshing after a delay...
        </SuccessMessage>
      ) : lastSavingErrorCode !== null ? (
        <ErrorMessage>
          Failed to save asset (code {lastSavingErrorCode})
        </ErrorMessage>
      ) : null}
    </>
  )
}

export default ClearIndicativeStatusButton
