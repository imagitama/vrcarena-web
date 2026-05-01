import React, { useState } from 'react'
import Button from '@/components/button'
import Dialog from '@/components/dialog'
import TextInput from '../text-input'
import FormControls from '../form-controls'

import {
  RepChange,
  CollectionNames as RepCollectionNames,
} from '@/modules/reputation'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import WarningMessage from '../warning-message'
import useTimer from '@/hooks/useTimer'

const AwardRepButton = ({ userId }: { userId: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [amountText, setAmountText] = useState('1')
  const [reasonText, setReasonText] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const closeModalAfterTimer = useTimer(() => setIsOpen(false))

  const [isLoading, isSuccess, lastErrorCode, create, clear, lastResult] =
    useDataStoreCreate<RepChange>(RepCollectionNames.RepChanges)

  const onClickAward = () => setIsVerifying(true)
  const onClickAwardVerified = async () => {
    setIsVerifying(false)

    const amountNum = parseInt(amountText)

    console.debug(
      `award user ${userId} with rep ${amountNum} reason "${reasonText}"`
    )

    await create({
      userid: userId,
      reason: 'custom',
      relateddata: { reason: reasonText.trim() },
      delta: amountNum,
    })

    closeModalAfterTimer()
  }

  return (
    <>
      <Button color="secondary" onClick={() => setIsOpen((val) => !val)}>
        Award Rep
      </Button>
      {isOpen && (
        <Dialog onClose={() => setIsOpen(false)}>
          <h1>Award Rep</h1>
          <h2>Amount (whole number)</h2>
          <TextInput
            onChange={(e) => setAmountText(e.target.value)}
            value={amountText}
          />
          <h2>Reason</h2>
          <TextInput
            onChange={(e) => setReasonText(e.target.value)}
            value={reasonText}
          />
          {lastErrorCode !== null && (
            <ErrorMessage>Failed to award (code {lastErrorCode})</ErrorMessage>
          )}
          {isSuccess === true && (
            <SuccessMessage>Awarded user successfully</SuccessMessage>
          )}
          {isLoading === true && <LoadingIndicator message="Awarding..." />}
          {isVerifying === true && (
            <WarningMessage>Are you sure?</WarningMessage>
          )}
          <FormControls>
            <Button onClick={isVerifying ? onClickAwardVerified : onClickAward}>
              {isVerifying ? 'Yes I am sure' : 'Award'}
            </Button>
          </FormControls>
        </Dialog>
      )}
    </>
  )
}

export default AwardRepButton
