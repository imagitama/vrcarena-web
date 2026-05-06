import React, { useState } from 'react'
import PublishIcon from '@mui/icons-material/Publish'

import { handleError } from '@/error-handling'
import { callFunction } from '@/firebase'
import { PublishErrorCode, getErrorMessageForCode } from '@/utils/assets'
import { Asset } from '@/modules/assets'
import * as routes from '@/routes'

import useHistory from '@/hooks/useHistory'
import useTimer from '@/hooks/useTimer'

import Button from '@/components/button'
import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import SuccessMessage from '@/components/success-message'
import WarningMessage from '@/components/warning-message'
import FormControls from '@/components/form-controls'
import Tooltip from '@/components/tooltip'
import {
  BlockingErrorTypes,
  getValidationErrorMessagesForAsset,
  NonBlockingErrorTypes,
  validationErrorMessages,
} from '@/utils/asset-validation'

const PublishAssetButton = ({
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
          <ErrorMessage title="Publish Failed" hintText={false}>
            Before the asset can be approved, some issues must be addressed:
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
            title="Recommendations"
            controls={
              <Button onClick={() => setIgnoreWarnings(true)} color="secondary">
                Ignore
              </Button>
            }>
            To improve your asset we recommend these improvements:
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

export default PublishAssetButton
