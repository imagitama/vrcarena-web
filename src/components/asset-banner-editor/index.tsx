import React from 'react'

import BannerUploader from '../banner-uploader'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import Button from '../button'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { Asset, CollectionNames } from '../../modules/assets'

const AssetBannerEditor = ({
  assetId = undefined,
  onDone = undefined,
  actionCategory = undefined,
  overrideSave = undefined,
  assetIdForBucket = undefined,
}: {
  assetId?: string
  onDone?: () => void
  actionCategory?: string
  overrideSave?: (url: string) => void
  // for amendments to work
  assetIdForBucket?: string
}) => {
  const [isSaving, isSaveSuccess, isSaveError, save, clear] =
    useDatabaseSave<Asset>(CollectionNames.Assets, assetId)

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage>
        Banner saved successfully <Button onClick={clear}>Okay</Button>
      </SuccessMessage>
    )
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save banner</ErrorMessage>
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
