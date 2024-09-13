import React, { useState } from 'react'
import PublishIcon from '@material-ui/icons/Publish'

import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import defaultThumbnailUrl from '../../assets/images/default-thumbnail.webp'

import Button from '../button'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import { Asset, AssetCategory } from '../../modules/assets'
import WarningMessage from '../warning-message'
import { adultSearchTerms } from '../../config'
import Message from '../message'
import FormControls from '../form-controls'
import useHistory from '../../hooks/useHistory'
import useTimer from '../../hooks/useTimer'
import * as routes from '../../routes'

const errorCodes: { [key: string]: string } = {
  IS_NOT_DRAFT: 'IS_NOT_DRAFT',
  NOT_CREATOR: 'NOT_CREATOR',
  USER_BANNED: 'USER_BANNED',
  UNKNOWN: 'UNKNOWN',
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

enum BlockingErrorTypes {
  NO_TITLE = 'NO_TITLE',
  DEFAULT_TITLE = 'DEFAULT_TITLE',
  NO_AUTHOR = 'NO_AUTHOR',
  NO_THUMBNAIL = 'NO_THUMBNAIL',
  NO_DESCRIPTION = 'NO_DESCRIPTION',
  NO_TAGS = 'NO_TAGS',
}

enum NonBlockingErrorTypes {
  INVALID_TITLE = 'INVALID_TITLE',
  NO_SPECIES = 'NO_SPECIES',
  SHORT_DESCRIPTION = 'SHORT_DESCRIPTION',
  NOT_MANY_TAGS = 'NOT_MANY_TAGS',
  NOT_MARKED_NSFW = 'NOT_MARKED_NSFW',
  MISSING_ACCESSORY_PARENT = 'MISSING_ACCESSORY_PARENT',
  NO_ATTACHMENTS = 'NO_ATTACHMENTS',
  NO_SOURCE_URL = 'NO_SOURCE_URL',
  NO_PAID_OR_FREE_TAG = 'NO_PAID_OR_FREE_TAG',
}

const validationErrorMessages = {
  [BlockingErrorTypes.NO_TITLE]: 'has no title',
  [BlockingErrorTypes.DEFAULT_TITLE]: 'is using the default title',
  [NonBlockingErrorTypes.INVALID_TITLE]: 'has an invalid title',
  [BlockingErrorTypes.NO_AUTHOR]: 'has no author',
  [NonBlockingErrorTypes.NO_SPECIES]: 'has no species',
  [BlockingErrorTypes.NO_THUMBNAIL]: 'has no thumbnail',
  [NonBlockingErrorTypes.NO_SOURCE_URL]: 'has no source URL',
  [BlockingErrorTypes.NO_DESCRIPTION]: 'has no description',
  [NonBlockingErrorTypes.SHORT_DESCRIPTION]:
    'has a too short description (less than 20 characters)',
  [BlockingErrorTypes.NO_TAGS]: 'has no tags',
  [NonBlockingErrorTypes.NOT_MANY_TAGS]: "hasn't got many tags (less than 4)",
  [NonBlockingErrorTypes.NOT_MARKED_NSFW]:
    'has not been flagged as NSFW even though it contains NSFW terms',
  [NonBlockingErrorTypes.MISSING_ACCESSORY_PARENT]:
    'has no linked asset (this is required if your accessory needs a base avatar)',
  [NonBlockingErrorTypes.NO_ATTACHMENTS]:
    'has no attached files (please attach at least one larger image)',
  [NonBlockingErrorTypes.NO_PAID_OR_FREE_TAG]: 'has no "free" or "paid" tag',
}

const getIfShouldBeNsfw = (asset: Asset): boolean => {
  if (asset.isadult) {
    return false
  }

  if (
    asset.description &&
    adultSearchTerms.some((term) =>
      asset.description.toLowerCase().includes(term)
    )
  ) {
    return true
  }
  if (
    asset.title &&
    adultSearchTerms.some((term) => asset.title.toLowerCase().includes(term))
  ) {
    return true
  }

  return false
}

const getValidationErrorMessagesForAsset = (
  asset: Asset
): (BlockingErrorTypes | NonBlockingErrorTypes)[] => {
  const messages = []

  if (!asset.title) {
    messages.push(BlockingErrorTypes.NO_TITLE)
  }
  if (asset.title && asset.title === 'My draft asset') {
    messages.push(BlockingErrorTypes.DEFAULT_TITLE)
  }
  if (!asset.author) {
    messages.push(BlockingErrorTypes.NO_AUTHOR)
  }
  if (
    asset.category === AssetCategory.Avatar &&
    (!asset.species || !asset.species.length)
  ) {
    messages.push(NonBlockingErrorTypes.NO_SPECIES)
  }
  if (!asset.thumbnailurl || asset.thumbnailurl === defaultThumbnailUrl) {
    messages.push(BlockingErrorTypes.NO_THUMBNAIL)
  }
  if (!asset.description) {
    messages.push(BlockingErrorTypes.NO_DESCRIPTION)
  }
  if (asset.description && asset.description.length < 20) {
    messages.push(NonBlockingErrorTypes.SHORT_DESCRIPTION)
  }
  if (!asset.tags || !asset.tags.length) {
    messages.push(BlockingErrorTypes.NO_TAGS)
  }
  if (asset.tags && asset.tags.length < 4) {
    messages.push(NonBlockingErrorTypes.NOT_MANY_TAGS)
  }
  if (
    asset.tags &&
    !asset.tags.includes('free') &&
    !asset.tags.includes('paid')
  ) {
    messages.push(NonBlockingErrorTypes.NO_PAID_OR_FREE_TAG)
  }
  if (getIfShouldBeNsfw(asset)) {
    messages.push(NonBlockingErrorTypes.NOT_MARKED_NSFW)
  }
  if (!asset.sourceurl) {
    messages.push(NonBlockingErrorTypes.NO_SOURCE_URL)
  }
  if (
    asset.category === AssetCategory.Accessory &&
    (!asset.relations || !asset.relations.length)
  ) {
    messages.push(NonBlockingErrorTypes.MISSING_ACCESSORY_PARENT)
  }

  return messages
}

export default ({
  assetId,
  asset,
  onDone = undefined,
}: {
  assetId: string
  asset: Asset
  onDone?: () => void
}) => {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null)
  const [lastValidationErrorTypes, setLastValidationErrorMessages] = useState<
    (BlockingErrorTypes | NonBlockingErrorTypes)[]
  >([])
  const [ignoreWarnings, setIgnoreWarnings] = useState(false)
  const { push } = useHistory()
  const navigateAfterDelay = useTimer(() => {
    push(routes.viewAssetWithVar.replace(':assetId', assetId))
  }, 3000)

  const attemptPublish = () => {
    console.debug('attempt publish')

    const newValidationErrorMessages = getValidationErrorMessagesForAsset(asset)
    setLastValidationErrorMessages(newValidationErrorMessages)

    const blockingValidationErrorTypes = newValidationErrorMessages.filter(
      (errorType) =>
        Object.values(BlockingErrorTypes).includes(errorType as any)
    )
    const nonBlockingValidationErrorTypes = newValidationErrorMessages.filter(
      (errorType) =>
        Object.values(NonBlockingErrorTypes).includes(errorType as any)
    )

    if (
      !blockingValidationErrorTypes.length &&
      (!nonBlockingValidationErrorTypes.length ||
        (nonBlockingValidationErrorTypes.length && ignoreWarnings))
    ) {
      publish()
    }
  }

  const publish = async () => {
    console.debug('publish')

    try {
      setIsPublishing(true)
      setIsSuccess(false)
      setLastErrorCode(null)

      const {
        data: { error },
      } = await callFunction<{ error?: string }>('publishAsset', { assetId })

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

      navigateAfterDelay()
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
        <br />
        <br />
        Redirecting you to the asset in 2 seconds...
      </SuccessMessage>
    )
  }

  console.log(lastValidationErrorTypes, BlockingErrorTypes)

  const blockingValidationErrorTypes = lastValidationErrorTypes.filter(
    (errorType) => Object.values(BlockingErrorTypes).includes(errorType as any)
  )
  const nonBlockingValidationErrorTypes = lastValidationErrorTypes.filter(
    (errorType) => Object.keys(NonBlockingErrorTypes).includes(errorType as any)
  )

  return (
    <div>
      <FormControls>
        <Button
          icon={<PublishIcon />}
          color="tertiary"
          onClick={attemptPublish}
          size="large">
          Publish For Approval
        </Button>
      </FormControls>
      {blockingValidationErrorTypes.length ? (
        <>
          <ErrorMessage hintText={false}>
            There were some validation issues with your asset that you must fix
            before it can be published:
            <ul>
              {blockingValidationErrorTypes.map((errorType) => (
                <li key={errorType}>
                  The asset {validationErrorMessages[errorType]}
                </li>
              ))}
            </ul>
          </ErrorMessage>
        </>
      ) : null}
      {nonBlockingValidationErrorTypes.length && !ignoreWarnings ? (
        <>
          <WarningMessage
            controls={
              <Button onClick={() => setIgnoreWarnings(true)} color="default">
                Ignore
              </Button>
            }>
            There were some validation issues with your asset that we recommend
            you fix:
            <ul>
              {nonBlockingValidationErrorTypes.map((errorType) => (
                <li key={errorType}>
                  The asset {validationErrorMessages[errorType]}
                </li>
              ))}
            </ul>
          </WarningMessage>
        </>
      ) : null}
    </div>
  )
}
