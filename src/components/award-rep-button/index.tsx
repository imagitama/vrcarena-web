import React, { useState } from 'react'

import {
  RepChange,
  CollectionNames as RepCollectionNames,
} from '@/modules/reputation'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'
import useTimer from '@/hooks/useTimer'

import Button from '@/components/button'
import Dialog from '@/components/dialog'
import TextInput from '@/components/text-input'
import FormControls from '@/components/form-controls'
import ErrorMessage from '@/components/error-message'
import SuccessMessage from '@/components/success-message'
import LoadingIndicator from '@/components/loading-indicator'
import WarningMessage from '@/components/warning-message'
import HintText from '@/components/hint-text'

const AwardRepButton = ({ userId }: { userId: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [amountText, setAmountText] = useState('1')
  const [reasonText, setReasonText] = useState('custom')
  const [customReasonText, setCustomReasonText] = useState('')
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
      reason: reasonText.trim(),
      relateddata: { reason: customReasonText.trim() },
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
          <h2>Amount</h2>
          <TextInput
            fullWidth
            onChange={(e) => setAmountText(e.target.value)}
            value={amountText}
          />
          <HintText>Whole number only eg. 123</HintText>
          <h2>Reason</h2>
          <TextInput
            fullWidth
            onChange={(e) => setReasonText(e.target.value)}
            value={reasonText}
          />
          <HintText>
            The ID of the reason from the database (this should be a dropdown).
            eg. "custom"
          </HintText>
          <h2>Reason</h2>
          <TextInput
            fullWidth
            onChange={(e) => setReasonText(e.target.value)}
            value={reasonText}
            multiline
            rows={3}
          />
          <HintText>Dumped into the "extra data" field</HintText>
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
            </Button>{' '}
            <Button onClick={() => setIsOpen(false)} color="secondary">
              Cancel
            </Button>
          </FormControls>
        </Dialog>
      )}
    </>
  )
}

export default AwardRepButton
