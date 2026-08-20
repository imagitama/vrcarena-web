import React from 'react'
import DeleteIcon from '@mui/icons-material/Delete'

import { handleError } from '@/error-handling'
import { FunctionNames } from '@/modules/amendments'

import useFirebaseFunction from '@/hooks/useFirebaseFunction'

import { ButtonProps, DeleteButton } from '@/components/button'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import DialogButton from '../dialog-button'
import SuccessMessage from '../success-message'
import FormControls from '../form-controls'
import useDataStoreFunction from '@/hooks/useDataStoreFunction'
import Heading from '../heading'
import useTimer from '@/hooks/useTimer'

enum DeleteMyAmendmentErrorCode {
  UserNotVerified = 'USER_NOT_VERIFIED',
  UserBanned = 'USER_BANNED',
  NotInQueue = 'NOT_IN_QUEUE',
  NotCreator = 'NOT_CREATOR',
  NotUndeleted = 'NOT_UNDELETED',
  AmendmentNotFound = 'AMENDMENT_NOT_FOUND',
}

export const getErrorMessageForCode = (errorCode: string): string => {
  switch (errorCode) {
    case DeleteMyAmendmentErrorCode.UserNotVerified:
      return 'Your account is not verified'
    case DeleteMyAmendmentErrorCode.UserBanned:
      return 'You are banned'
    case DeleteMyAmendmentErrorCode.AmendmentNotFound:
      return 'Amendment not found'
    case DeleteMyAmendmentErrorCode.NotUndeleted:
      return 'The amendment is already deleted'
    case DeleteMyAmendmentErrorCode.NotCreator:
      return 'You are not the creator of the amendment'
    case DeleteMyAmendmentErrorCode.NotInQueue:
      return 'The amendment is not waiting in the queue'

    default:
      return 'Unknown'
  }
}

interface DeleteMyAmendmentPayload {
  amendmentid: string
}
interface DeleteMyAmendmentResult {
  success?: boolean
}

const DeleteMyAmendmentButton = ({
  amendmentId,
  onDone = undefined,
  ...buttonProps
}: {
  amendmentId: string
  onDone?: () => void
} & ButtonProps) => {
  const [isCalling, lastErrorCodeCalling, lastResult, call, clear] =
    useDataStoreFunction<DeleteMyAmendmentPayload, DeleteMyAmendmentResult>(
      FunctionNames.DeleteMyAmendment,
      Object.values(DeleteMyAmendmentErrorCode)
    )
  const onDoneAfterDelay = useTimer(onDone)

  const isSuccess = lastResult?.success === true

  const onClickDelete = async () => {
    try {
      const result = await call({ amendmentid: amendmentId })

      if (result?.success) {
        console.debug('amendment was deleted!')

        onDoneAfterDelay()
      } else {
        console.error('amendment was NOT deleted!')
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      <DialogButton
        dialog={
          <>
            <Heading variant="h1" noTopMargin>
              Delete Your Amendment
            </Heading>
            {isCalling ? (
              <LoadingIndicator message="Deleting amendment..." />
            ) : isSuccess ? (
              <SuccessMessage noMargin>
                Amendment deleted successfully, refreshing in a moment...
              </SuccessMessage>
            ) : lastErrorCodeCalling !== null ? (
              <ErrorMessage
                noMargin
                errorCode={lastErrorCodeCalling as string}
                onOkay={clear}>
                Failed to delete your amendment:{' '}
                {getErrorMessageForCode(lastErrorCodeCalling as string)}
              </ErrorMessage>
            ) : (
              <>
                Are you sure you want to delete this amendment?
                <FormControls>
                  <DeleteButton color="primary" onClick={onClickDelete}>
                    Yes! Delete!
                  </DeleteButton>
                </FormControls>
              </>
            )}
          </>
        }
        icon={<DeleteIcon />}
        color="secondary"
        {...buttonProps}>
        Delete Your Amendment
      </DialogButton>
    </>
  )
}

export default DeleteMyAmendmentButton
