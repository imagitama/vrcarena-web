import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { formHideDelay } from '../../config'
import { CollectionNames } from '../../data-store'
import { handleError } from '../../error-handling'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'
import useTimer from '../../hooks/useTimer'
import { getAvatarIdFromUserInput } from '../../utils'

import Button from '../button'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import Paper from '../paper'
import SuccessMessage from '../success-message'
import TextInput from '../text-input'

import screenshotUrl from './assets/images/screenshot.webp'
import FormControls from '../form-controls'

interface PublicAvatarCreateFields {
  asset: string
  vrchatAvatarId: string
}

const useStyles = makeStyles({
  controls: {
    margin: '0.5rem 0',
    display: 'flex'
  },
  input: {
    width: '100%',
    marginRight: '0.25rem'
  },
  message: {
    fontSize: '125%',
    textAlign: 'center',
    marginBottom: '0.5rem'
  }
})

// we have bots submitting this ID for some reason
const blockedAvatarIds = ['avtr_c38a1615-5bf5-42b4-84eb-a8b6c37cbd11']

const Form = ({ assetId }: { assetId: string }) => {
  if (!assetId) {
    throw new Error('Asset ID not provided')
  }

  const [isCreating, isSuccess, isFailed, create] = useDataStoreCreate<
    PublicAvatarCreateFields
  >(CollectionNames.PublicAvatarSubmissions)
  const [userInput, setUserInput] = useState<string>('')
  const [isInvalidAvatarId, setIsInvalidAvatarId] = useState<boolean>(false)
  const [isSuccessOverride, setIsSuccessOverride] = useState<boolean>(false)
  const classes = useStyles()

  const clearfterDelay = useTimer(() => {
    setIsInvalidAvatarId(false)
    setIsSuccessOverride(false)
  }, formHideDelay)

  const send = async () => {
    try {
      const vrchatAvatarId = getAvatarIdFromUserInput(userInput)

      if (!vrchatAvatarId) {
        setIsInvalidAvatarId(true)
        clearfterDelay()
        return
      }

      if (blockedAvatarIds.includes(vrchatAvatarId)) {
        await new Promise(resolve => setTimeout(() => resolve(undefined), 1000))
        setIsSuccessOverride(true)
        clearfterDelay()
        return
      }

      await create({
        asset: assetId,
        vrchatAvatarId
      })

      setUserInput('')
      setIsInvalidAvatarId(false)
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      {isInvalidAvatarId ? (
        <ErrorMessage>
          That avatar URL or ID looks invalid. Please make sure it is correct
        </ErrorMessage>
      ) : null}
      {isCreating ? (
        <LoadingIndicator message="Sending..." />
      ) : isSuccess || isSuccessOverride ? (
        <SuccessMessage>
          The avatar has been sent to our team! Would you like to add another?
        </SuccessMessage>
      ) : isFailed ? (
        <ErrorMessage>
          Failed to send. This shouldn't happen. Please come back tomorrow to
          try again.
        </ErrorMessage>
      ) : null}
      Enter the URL or ID of the avatar:
      <div className={classes.controls}>
        <TextInput
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          isDisabled={isCreating}
          size="small"
          className={classes.input}
        />{' '}
        <Button isDisabled={isCreating} onClick={() => send()}>
          Send
        </Button>
      </div>
      <img src={screenshotUrl} width="50%" />
    </>
  )
}

export default ({
  assetId,
  isExpanded: isExpandedByDefault = false
}: {
  assetId: string
  isExpanded?: boolean
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(isExpandedByDefault)
  const classes = useStyles()

  return (
    <Paper>
      <div className={classes.message}>
        Do you have this avatar in your favorites? We need your help! Please
        anonymously send us the avatar ID so we can show it on the site:
      </div>
      {isExpanded ? (
        <>
          <br />
          <br />
          <Form assetId={assetId} />
        </>
      ) : (
        <FormControls>
          <Button onClick={() => setIsExpanded(true)} size="large">
            Show me the form
          </Button>
        </FormControls>
      )}
    </Paper>
  )
}
