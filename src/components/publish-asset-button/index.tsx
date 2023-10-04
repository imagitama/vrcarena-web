import React, { useState } from 'react'
import PublishIcon from '@material-ui/icons/Publish'

import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import defaultThumbnailUrl from '../../assets/images/default-thumbnail.webp'

import Button from '../button'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import { Asset } from '../../modules/assets'
import WarningMessage from '../warning-message'
import { adultSearchTerms } from '../../config'
import { AssetCategories } from '../../hooks/useDatabaseQuery'

const errorCodes: { [key: string]: string } = {
  IS_NOT_DRAFT: 'IS_NOT_DRAFT',
  NOT_CREATOR: 'NOT_CREATOR',
  USER_BANNED: 'USER_BANNED',
  UNKNOWN: 'UNKNOWN'
}

const getErrorMessageForCode = (errorCode: string): string => {
  switch (errorCode) {
    case errorCodes.IS_NOT_DRAFT:
      return 'Only drafts can be published'
    case errorCodes.NOT_CREATOR:
      return 'You are not the creator of this asset'
    case errorCodes.USER_BANNED:
      return 'You are banned'
    default:
      return 'Unknown'
  }
}

const validationErrorMessages = {
  NO_TITLE: 'has no title',
  DEFAULT_TITLE: 'is using the default title',
  INVALID_TITLE: 'has an invalid title',
  NO_AUTHOR: 'has no author',
  NO_SPECIES: 'has no species',
  NO_THUMBNAIL: 'has no thumbnail',
  NO_SOURCE_URL: 'has no source URL',
  NO_DESCRIPTION: 'has no description',
  SHORT_DESCRIPTION: 'has a too short description (less than 20 characters)',
  NO_TAGS: 'has no tags',
  NOT_MANY_TAGS: "hasn't got many tags (less than 4)",
  NOT_MARKED_NSFW:
    'has not been flagged as NSFW even though it contains NSFW terms',
  MISSING_ACCESSORY_PARENT:
    'has no linked asset (this is required if your accessory needs a base avatar)',
  NO_ATTACHMENTS:
    'has no attached files (please attach at least one larger image)'
}

const getIfShouldBeNsfw = (asset: Asset): boolean => {
  if (
    asset.description &&
    adultSearchTerms.some(term => asset.description.includes(term))
  ) {
    return true
  }
  if (
    asset.title &&
    adultSearchTerms.some(term => asset.title.includes(term))
  ) {
    return true
  }

  return false
}

const getValidationErrorMessagesForAsset = (asset: Asset): string[] => {
  const messages = []

  if (!asset.title) {
    messages.push(validationErrorMessages.NO_TITLE)
  }
  if (asset.title && asset.title === 'My draft asset') {
    messages.push(validationErrorMessages.DEFAULT_TITLE)
  }
  if (!asset.author) {
    messages.push(validationErrorMessages.NO_AUTHOR)
  }
  if (
    asset.category === AssetCategories.avatar &&
    (!asset.species || !asset.species.length)
  ) {
    messages.push(validationErrorMessages.NO_SPECIES)
  }
  if (!asset.thumbnailurl || asset.thumbnailurl === defaultThumbnailUrl) {
    messages.push(validationErrorMessages.NO_THUMBNAIL)
  }
  if (!asset.description) {
    messages.push(validationErrorMessages.NO_DESCRIPTION)
  }
  if (asset.description && asset.description.length < 20) {
    messages.push(validationErrorMessages.SHORT_DESCRIPTION)
  }
  if (!asset.tags || !asset.tags.length) {
    messages.push(validationErrorMessages.NO_TAGS)
  }
  if (asset.tags && asset.tags.length < 4) {
    messages.push(validationErrorMessages.NOT_MANY_TAGS)
  }
  if (getIfShouldBeNsfw(asset)) {
    messages.push(validationErrorMessages.NOT_MARKED_NSFW)
  }
  if (!asset.sourceurl) {
    messages.push(validationErrorMessages.NO_SOURCE_URL)
  }
  if (!asset.fileurls || !asset.fileurls.length) {
    messages.push(validationErrorMessages.NO_ATTACHMENTS)
  }
  // if (
  //   asset.category === AssetCategories.accessory &&
  //   (!asset.children || !asset.children.length)
  // ) {
  //   messages.push(validationErrorMessages.MISSING_ACCESSORY_PARENT)
  // }

  return messages
}

export default ({
  assetId,
  asset,
  onDone = undefined
}: {
  assetId: string
  asset: Asset
  onDone?: () => void
}) => {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null)
  const [
    lastValidationErrorMessages,
    setLastValidationErrorMessages
  ] = useState<string[]>([])

  const attemptPublish = () => {
    const newValidationErrorMessages = getValidationErrorMessagesForAsset(asset)
    setLastValidationErrorMessages(newValidationErrorMessages)

    if (!newValidationErrorMessages.length) {
      publish()
    }
  }

  const publish = async () => {
    try {
      setIsPublishing(true)
      setIsSuccess(false)
      setLastErrorCode(null)

      const {
        data: { error }
      } = await callFunction('publishAsset', { assetId })

      if (error) {
        console.error(`Failed to publish asset: ${error}`)
        setIsPublishing(false)
        setLastErrorCode(error)
        return
      }

      setIsPublishing(false)
      setIsSuccess(true)
      setLastErrorCode(null)

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to publish asset', err)
      handleError(err)

      setIsPublishing(false)
      setIsSuccess(false)
      setLastErrorCode(errorCodes.UNKNOWN)
    }
  }

  if (isPublishing) {
    return <LoadingIndicator message="Publishing..." />
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage>
        Failed to publish: ${getErrorMessageForCode(lastErrorCode)}
      </ErrorMessage>
    )
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        Asset has been published successfully. It will be reviewed by our staff
        (usually within 24 hours).
      </SuccessMessage>
    )
  }

  return (
    <>
      <Button
        icon={<PublishIcon />}
        color="tertiary"
        onClick={lastValidationErrorMessages.length ? publish : attemptPublish}>
        Publish For Approval
        {lastValidationErrorMessages.length ? ' (Anyway)' : ''}
      </Button>
      {lastValidationErrorMessages.length ? (
        <>
          <p>
            <strong>
              There were some validation issues with your asset that you should
              review before you try publishing again:
            </strong>
          </p>
          {lastValidationErrorMessages.map(message => (
            <WarningMessage leftAlign>The asset {message}</WarningMessage>
          ))}
        </>
      ) : null}
    </>
  )
}
