import React, { useState } from 'react'
import PublishIcon from '@mui/icons-material/Publish'

import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import { PublishErrorCode, getErrorMessageForCode } from '../../utils/assets'
import { PublishStatus } from '../../modules/common'
import { AssetMeta, CollectionNames } from '../../modules/assets'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import Button from '../button'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'

const AdminPublishButton = ({
  assetId,
  onDone = undefined,
  existingPublishStatus = undefined,
}: {
  assetId: string
  onDone?: () => void
  existingPublishStatus?: PublishStatus
}) => {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublishSuccess, setIsPublishSuccess] = useState(false)
  const [lastPublishErrorCode, setLastPublishErrorCode] = useState<
    string | null
  >(null)
  const [isSaving, , lastSaveErrorCode, save] = useDatabaseSave<AssetMeta>(
    CollectionNames.AssetsMeta,
    assetId
  )

  const onClickPublish = async () => {
    try {
      setIsPublishing(true)
      setIsPublishSuccess(false)
      setLastPublishErrorCode(null)

      const {
        data: { error },
      } = await callFunction<{ assetId: string }, { error?: string }>(
        'publishAsset',
        { assetId }
      )

      if (error) {
        console.error(`Failed to publish asset: ${error}`)
        setIsPublishing(false)
        setLastPublishErrorCode(error)
        return
      }

      setIsPublishing(false)
      setIsPublishSuccess(true)
      setLastPublishErrorCode(null)

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to publish asset', err)
      handleError(err)

      setIsPublishing(false)
      setIsPublishSuccess(false)
      setLastPublishErrorCode(PublishErrorCode.UNKNOWN)
    }
  }

  const onClickDraft = async () => {
    try {
      await save({
        publishstatus: PublishStatus.Draft,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to set to draft', err)
      handleError(err)
    }
  }

  if (isPublishing || isSaving) {
    return (
      <LoadingIndicator
        message={isPublishing ? 'Publishing...' : 'Setting as draft...'}
      />
    )
  }

  if (lastPublishErrorCode || lastSaveErrorCode) {
    return (
      <ErrorMessage>
        Failed to publish:{' '}
        {lastSaveErrorCode
          ? lastSaveErrorCode
          : getErrorMessageForCode(lastPublishErrorCode!)}
      </ErrorMessage>
    )
  }

  if (isPublishSuccess) {
    return (
      <SuccessMessage>
        Asset has been published successfully. It will be reviewed by our staff
        (usually within 24 hours).
        <br />
        <br />
        Redirecting you to the asset in 2 seconds...
      </SuccessMessage>
    )
  }

  const canDoSomething = existingPublishStatus !== undefined

  return (
    <Button
      icon={<PublishIcon />}
      onClick={
        existingPublishStatus === PublishStatus.Draft
          ? onClickPublish
          : onClickDraft
      }
      size="small"
      isDisabled={!canDoSomething}
      title={
        existingPublishStatus === PublishStatus.Draft
          ? 'Notifies staff it needs approval'
          : 'Only reverts the record - does not notify'
      }>
      {existingPublishStatus === PublishStatus.Draft
        ? 'Publish For Approval'
        : 'Revert To Draft'}
    </Button>
  )
}

export default AdminPublishButton
