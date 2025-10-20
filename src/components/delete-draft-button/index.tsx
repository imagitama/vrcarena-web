import React, { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'

import { handleError } from '../../error-handling'
import { FirebaseFunctionNames } from '../../modules/assets'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import Dialog from '../dialog'
import ErrorMessage from '../error-message'
import useFirebaseFunction from '@/hooks/useFirebaseFunction'

enum ErrorCode {
  NotDraft = 'not-draft',
  NotAllowed = 'not-allowed',
}

const DeleteDraftButton = ({
  assetId,
  onDone = undefined,
}: {
  assetId: string
  onDone?: () => void
}) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isCalling, lastErrorCodeCalling, lastResult, call, clear] =
    useFirebaseFunction<
      { assetId: string },
      { errorCode?: ErrorCode; success?: true }
    >(FirebaseFunctionNames.DeleteDraft)

  if (isCalling) {
    return <LoadingIndicator message={'Deleting...'} />
  }

  if (lastErrorCodeCalling !== null || (lastResult && lastResult.errorCode)) {
    return (
      <ErrorMessage onOkay={clear}>
        Failed to delete draft (code{' '}
        {lastErrorCodeCalling !== null
          ? lastErrorCodeCalling
          : lastResult?.errorCode}
        )
      </ErrorMessage>
    )
  }

  const performDelete = async () => {
    try {
      const { success } = await call({ assetId })

      if (success) {
        console.debug('asset was deleted!')

        if (onDone) {
          onDone()
        }
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onClickTry = () => setIsConfirming(true)

  return (
    <>
      {isConfirming && (
        <Dialog onClose={() => setIsConfirming(false)}>
          Are you sure you want to delete this draft?
          <Button onClick={performDelete}>Yes</Button>{' '}
          <Button color="secondary" onClick={() => setIsConfirming(false)}>
            No
          </Button>
        </Dialog>
      )}
      <Button onClick={onClickTry} icon={<DeleteIcon />} color="secondary">
        Delete Your Draft
      </Button>
    </>
  )
}

export default DeleteDraftButton
