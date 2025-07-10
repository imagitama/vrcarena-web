import React from 'react'

import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { Asset, CollectionNames } from '../../modules/assets'

import BannerUploader from '../banner-uploader'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import Button from '../button'

const AssetBannerEditor = ({
  assetId,
  onDone,
  actionCategory,
  overrideSave,
  assetIdForBucket,
}: {
  assetId: string | null
  onDone?: () => void
  actionCategory?: string
  overrideSave?: (url: string) => void
  // for amendments to work
  assetIdForBucket?: string
}) => {
  const [isSaving, isSaveSuccess, lastErrorCode, save, clear] =
    useDataStoreEdit<Asset>(CollectionNames.Assets, assetId || false)

  if (isSaving) {
    return <LoadingIndicator message="Saving asset banner..." />
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage onOkay={clear}>Banner saved successfully</SuccessMessage>
    )
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to save banner (code {lastErrorCode})</ErrorMessage>
    )
  }

  const onUploadedWithUrls = async (urls: string[]) => {
    try {
      const url = urls[0]

      if (overrideSave) {
        overrideSave(url)

        if (onDone) {
          onDone()
        }
        return
      }

      if (actionCategory) {
        trackAction(actionCategory, 'Click save banner button')
      }

      if (!assetId) {
        return
      }

      await save({
        bannerurl: url,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset banner', err)
      handleError(err)
    }
  }

  return (
    <>
      <BannerUploader
        assetId={assetIdForBucket || assetId || ''}
        onDone={onUploadedWithUrls}
      />
    </>
  )
}

export default AssetBannerEditor
