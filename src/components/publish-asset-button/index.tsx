import React, { useState } from 'react'
import PublishIcon from '@mui/icons-material/Publish'

import { FullAsset, FunctionNames } from '@/modules/assets'
import { PublishStatus } from '@/modules/common'
import {
  BlockingErrorTypes,
  getValidationErrorMessagesForAsset,
  NonBlockingErrorTypes,
  validationErrorMessages,
} from '@/utils/asset-validation'

import useDataStoreFunction from '@/hooks/useDataStoreFunction'

import Button from '@/components/button'
import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import SuccessMessage from '@/components/success-message'
import WarningMessage from '@/components/warning-message'
import FormControls from '@/components/form-controls'
import Tooltip from '@/components/tooltip'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/modules'
import store from '@/store'
import { incrementPublishedAssetCount } from '@/modules/app'
import {
  getCanAssetBePublished,
  getCanAssetBeUnpublished,
} from '@/utils/assets'

interface PublishAssetPayload {
  assetid: string
}

interface PublishAssetResponse {
  success: boolean
}

enum PublishErrorCode {
  USER_NOT_VERIFIED = 'USER_NOT_VERIFIED',
  USER_BANNED = 'USER_BANNED',
  ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
  IS_NOT_DRAFT = 'IS_NOT_DRAFT',
  NOT_CREATOR = 'NOT_CREATOR',
}

enum UnpublishErrorCode {
  USER_NOT_VERIFIED = 'USER_NOT_VERIFIED',
  ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
  NOT_PUBLISHER = 'NOT_PUBLISHER',
}

export const getErrorMessageForCode = (
  errorCode: PublishFlowErrorCode
): string => {
  switch (errorCode) {
    case PublishErrorCode.IS_NOT_DRAFT:
      return 'Only drafts can be published'
    case PublishErrorCode.NOT_CREATOR:
      return 'You are not the creator of this asset'
    case PublishErrorCode.USER_BANNED:
      return 'You are banned'
    default:
      return 'Unknown'
  }
}

export type PublishFlowErrorCode = PublishErrorCode | UnpublishErrorCode

const PublishAssetButton = ({
  assetId,
  asset,
  onDone,
  isDisabled,
}: {
  assetId: string
  asset: FullAsset
  onDone?: () => void
  isDisabled?: boolean
}) => {
  const isAlreadyPublished = asset.publishstatus === PublishStatus.Published

  const [isCalling, lastErrorCode, lastResult, callFunc] = useDataStoreFunction<
    PublishAssetPayload,
    PublishAssetResponse
  >(
    isAlreadyPublished
      ? FunctionNames.UnpublishAsset
      : FunctionNames.PublishAsset,
    Object.values(isAlreadyPublished ? UnpublishErrorCode : PublishErrorCode)
  )
  const [lastValidationErrorTypes, setLastValidationErrorMessages] = useState<
    (BlockingErrorTypes | NonBlockingErrorTypes)[]
  >([])
  const [ignoreWarnings, setIgnoreWarnings] = useState(false)
  const dispatch = useDispatch<typeof store.dispatch>()
  const refreshMyQueuedAssetsMessage = () =>
    dispatch(incrementPublishedAssetCount())

  if (isAlreadyPublished && !getCanAssetBeUnpublished(asset)) {
    return null
  }

  if (!isAlreadyPublished && !getCanAssetBePublished(asset)) {
    return null
  }

  const onClickPublish = async () => {
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

    console.debug(`onClickPublish`)

    if (
      !blockingValidationErrorTypes.length &&
      (!nonBlockingValidationErrorTypes.length ||
        (nonBlockingValidationErrorTypes.length && ignoreWarnings))
    ) {
      await callFunc({
        assetid: assetId,
      })

      refreshMyQueuedAssetsMessage()

      if (onDone) onDone()
    }
  }

  const onClickUnpublish = async () => {
    console.debug(`onClickUnpublish`)

    await callFunc({
      assetid: assetId,
    })

    refreshMyQueuedAssetsMessage()

    if (onDone) onDone()
  }

  if (isCalling) {
    return (
      <LoadingIndicator
        message={
          isAlreadyPublished ? 'Reverting to draft...' : 'Publishing asset...'
        }
      />
    )
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage>
        Failed to publish:{' '}
        {getErrorMessageForCode(lastErrorCode as PublishFlowErrorCode)}
      </ErrorMessage>
    )
  }

  const isSuccess = lastResult?.success === true

  if (isSuccess) {
    // invert success as we re-render and it should be the opposite
    if (!isAlreadyPublished) {
      return (
        <SuccessMessage>
          Asset removed from the approval queue successfully. It is now a draft
          and you can edit it. You will need to publish it again.
        </SuccessMessage>
      )
    } else {
      return (
        <SuccessMessage>
          Asset has been published successfully. It is in the approval queue.
          <br />
          <br />
          If you have enough reputation (eg. your account is over 1 month old)
          it may be automatically approved.
          <br />
          <br />
          <strong>
            If it has been longer than 48 hours please open a support ticket to
            have it actioned.
          </strong>
        </SuccessMessage>
      )
    }
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
            isAlreadyPublished
              ? 'Removes the asset from the queue and lets you edit it again'
              : 'Adds the asset to the queue and notifies our staff'
          }>
          <Button
            icon={<PublishIcon />}
            color="tertiary"
            onClick={isAlreadyPublished ? onClickUnpublish : onClickPublish}
            size="large"
            isDisabled={isDisabled}>
            {isAlreadyPublished ? 'Un-publish' : 'Publish For Approval'}
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
                Ignore (click publish again)
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
