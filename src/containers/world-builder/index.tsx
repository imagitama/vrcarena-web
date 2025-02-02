import React, { useState } from 'react'

import useUserRecord from '../../hooks/useUserRecord'
import useFirebaseFunction from '../../hooks/useFirebaseFunction'
import { handleError } from '../../error-handling'
import Button from '../../components/button'
import TextInput from '../../components/text-input'
import ErrorMessage from '../../components/error-message'
import SuccessMessage from '../../components/success-message'
import LoadingIndicator from '../../components/loading-indicator'

interface WorldBuilderRecord {}

export default () => {
  const [, , user] = useUserRecord()
  const [userInput, setUserInput] = useState('')
  const [isWorking, isError, lastResult, performCall] = useFirebaseFunction<
    { record: WorldBuilderRecord },
    { success: boolean }
  >('updateWorldBuilderRecord')

  if (!user) {
    return <>Not logged in</>
  }

  const vrchatUsername = user.vrchatusername || ''

  if (!vrchatUsername) {
    return (
      <>
        You need to set a VRChat username by going to My Account {'->'} Social{' '}
        {'->'} VRChat user ID
      </>
    )
  }

  const save = async () => {
    try {
      if (!userInput) {
        return
      }

      const record = JSON.parse(userInput)

      const { success } = await performCall({
        record: {
          ...record,
          // NOTE: Waiting to see how we can get unique ID
          vrchatplayerid: vrchatUsername,
        },
      })

      if (success) {
        setUserInput('')
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (isWorking) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to save</ErrorMessage>
  }

  return (
    <>
      {!isWorking && lastResult ? (
        lastResult.success ? (
          <SuccessMessage>Saved successfully</SuccessMessage>
        ) : (
          <ErrorMessage>Failed to save</ErrorMessage>
        )
      ) : null}
      <TextInput
        multiline
        minRows={5}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      <Button onClick={save}>Save</Button>
    </>
  )
}
