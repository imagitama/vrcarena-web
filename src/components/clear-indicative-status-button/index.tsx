import React from 'react'
import Button from '@/components/button'
import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import { handleError } from '@/error-handling'
import { AssetMeta, CollectionNames } from '@/modules/assets'
import useTimer from '@/hooks/useTimer'
import SuccessMessage from '@/components/success-message'
import ErrorMessage from '@/components/error-message'

const ClearIndicativeStatusButton = ({
  assetId,
  onDone,
}: {
  assetId: string
  onDone?: () => void
}) => {
  const [isSaving, isSuccess, lastErrorCode, save] =
    useDataStoreEdit<AssetMeta>(CollectionNames.AssetsMeta, assetId, {
      queryName: 'clear-indicative-status',
    })
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
      {isSuccess ? (
        <SuccessMessage>
          Asset saved, refreshing after a delay...
        </SuccessMessage>
      ) : lastErrorCode !== null ? (
        <ErrorMessage errorCode={lastErrorCode}>
          Failed to save asset
        </ErrorMessage>
      ) : null}
    </>
  )
}

export default ClearIndicativeStatusButton
