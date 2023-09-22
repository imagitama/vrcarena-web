import React from 'react'

import BannerUploader from '../banner-uploader'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import Button from '../button'
import WarningMessage from '../warning-message'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

export default ({
  assetId = undefined,
  onDone = undefined,
  actionCategory = undefined,
  overrideSave = undefined,
  assetIdForBucket = undefined
}: {
  assetId?: string
  onDone?: () => void
  actionCategory?: string
  overrideSave?: (url: string) => void
  // for amendments to work
  assetIdForBucket?: string
}) => {
  const [isSaving, isSaveSuccess, isSaveError, save, clear] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

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

      trackAction(actionCategory, 'Click save banner button')

      if (!assetId) {
        return
      }

      await save({
        [AssetFieldNames.bannerUrl]: url
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
      <WarningMessage noTopMargin>
        As of April 2023 we are migrating to a new way of uploading thumbnails.
        Please contact me (Peanut#1756) if you experience any issues with this
      </WarningMessage>
      <BannerUploader
        assetId={assetIdForBucket || assetId || ''}
        onDone={onUploadedWithUrls}
      />
    </>
  )
}
