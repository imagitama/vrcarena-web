import React, { useState } from 'react'
import PublishIcon from '@mui/icons-material/Publish'

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
import FormControls from '../form-controls'
import useHistory from '../../hooks/useHistory'
import useTimer from '../../hooks/useTimer'
import * as routes from '../../routes'
import { PublishErrorCode, getErrorMessageForCode } from '../../utils/assets'
import Tooltip from '../tooltip'

enum BlockingErrorTypes {
  NO_SOURCE_URL = 'NO_SOURCE_URL',
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
  NO_PAID_OR_FREE_TAG = 'NO_PAID_OR_FREE_TAG',
}

const validationErrorMessages = {
  [BlockingErrorTypes.NO_TITLE]: 'has no title',
  [BlockingErrorTypes.DEFAULT_TITLE]: 'is using the default title',
  [NonBlockingErrorTypes.INVALID_TITLE]: 'has an invalid title',
  [BlockingErrorTypes.NO_AUTHOR]: 'has no author',
  [NonBlockingErrorTypes.NO_SPECIES]: 'has no species',
  [BlockingErrorTypes.NO_THUMBNAIL]: 'has no thumbnail',
  [BlockingErrorTypes.NO_SOURCE_URL]: 'has no source URL',
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
    messages.push(BlockingErrorTypes.NO_SOURCE_URL)
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
  enableRedirect = true,
  isDisabled = false,
}: {
  assetId: string
  asset: Asset
  onDone?: () => void
  enableRedirect?: boolean
  isDisabled?: boolean
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
  }, 4000)

  const attemptPublish = () => {
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
    try {
      setIsPublishing(true)
      setIsSuccess(false)
      setLastErrorCode(null)

      const {
        data: { error },
      } = await callFunction<{ assetId: string }, { error?: string }>(
        'publishAsset',
        { assetId }
      )

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

      if (enableRedirect) {
        navigateAfterDelay()
      }
    } catch (err) {
      console.error('Failed to publish asset', err)
      handleError(err)

      setIsPublishing(false)
      setIsSuccess(false)
      setLastErrorCode(PublishErrorCode.UNKNOWN)
    }
  }

  if (isPublishing) {
    return <LoadingIndicator message="Publishing..." />
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage>
        Failed to publish: {getErrorMessageForCode(lastErrorCode)}
      </ErrorMessage>
    )
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        Asset has been published successfully. It is in the approval queue.
        <br />
        <br />
        If you have enough reputation (eg. your account is over 1 month old) it
        may be automatically approved.
        <br />
        <br />
        <strong>
          If it has been longer than 48 hours please open a support ticket to
          have it actioned.
        </strong>
        {enableRedirect && (
          <>
            <br />
            <br />
            Redirecting you to the asset in 4 seconds...
          </>
        )}
      </SuccessMessage>
    )
  }

  const blockingValidationErrorTypes = lastValidationErrorTypes.filter(
    (errorType) => Object.values(BlockingErrorTypes).includes(errorType as any)
  )
  const nonBlockingValidationErrorTypes = lastValidationErrorTypes.filter(
    (errorType) => Object.keys(NonBlockingErrorTypes).includes(errorType as any)
  )

  return (
    <div>
      <FormControls>
        <Tooltip
          title={
            isDisabled
              ? ''
              : 'Asset cannot be published (may already be in the queue)'
          }>
          <Button
            icon={<PublishIcon />}
            color="tertiary"
            onClick={attemptPublish}
            size="large"
            isDisabled={isDisabled}>
            Publish For Approval
          </Button>
        </Tooltip>
      </FormControls>
      {blockingValidationErrorTypes.length ? (
        <>
          <ErrorMessage title="Validation Issues" hintText={false}>
            There are some issues with your asset that must be fixed before it
            can be published for approval:
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
            title="Recommended Changes"
            controls={
              <Button onClick={() => setIgnoreWarnings(true)} color="secondary">
                Ignore
              </Button>
            }>
            There are some issues with your asset that we recommend you fix:
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
