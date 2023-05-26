import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'

import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import { getAvatarIdFromUserInput } from '../../utils'

import FormControls from '../form-controls'
import TextInput from '../text-input'
import Button from '../button'
import VrchatAvatar from '../vrchat-avatar'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'

const useStyles = makeStyles({
  label: {
    marginBottom: '0.5rem',
    fontWeight: 'bold'
  },
  inputWrapper: {
    display: 'flex'
  },
  input: {
    flex: 1,
    marginRight: '0.5rem'
  }
})

export default ({ onDone }) => {
  const [textInputValue, setTextInputValue] = useState('')
  const [avatarId, setAvatarId] = useState('')
  const classes = useStyles()
  const [isGettingAvatar, setIsGettingAvatar] = useState(false)
  const [didFailGettingAvatar, setDidFailGettingAvatar] = useState(false)
  const [avatarData, setAvatarData] = useState(null)

  const lookupAvatar = async () => {
    try {
      const avatarIdFromUserInput = getAvatarIdFromUserInput(textInputValue)

      if (!avatarIdFromUserInput) {
        return
      }

      setAvatarId(avatarIdFromUserInput)
      setIsGettingAvatar(true)
      setDidFailGettingAvatar(false)
      setAvatarData(null)

      // NOTE: This function also dumps it into a cache for later retrieval
      const {
        data: { avatar }
      } = await callFunction('getVrchatAvatarDetails', {
        avatarId: avatarIdFromUserInput
      })

      setIsGettingAvatar(false)
      setDidFailGettingAvatar(false)
      setAvatarData(avatar)
    } catch (err) {
      console.error(err)
      handleError(err)

      setIsGettingAvatar(false)
      setDidFailGettingAvatar(true)
    }
  }

  const retry = () => {
    setAvatarId('')
    setIsGettingAvatar(false)
    setDidFailGettingAvatar(false)
    setAvatarData(null)
  }

  if (isGettingAvatar) {
    return <LoadingIndicator message="Looking up VRChat avatar..." />
  }

  if (didFailGettingAvatar) {
    return (
      <ErrorMessage>
        Failed to find avatar. Please verify the avatar ID. There might be an
        issue communicating with VRChat
        <br />
        <br />
        <Button onClick={retry}>Try Again</Button>
      </ErrorMessage>
    )
  }

  if (avatarData) {
    return (
      <div>
        <VrchatAvatar avatarData={avatarData} />
        <FormControls>
          <Button onClick={() => onDone(avatarId, avatarData, retry)}>
            Done
          </Button>{' '}
          <Button onClick={retry} color="default">
            Retry
          </Button>
        </FormControls>
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <p>
        Enter the URL of the avatar or the avatar ID: (eg.
        avtr_69f1893b-2d7c-4d19-beb4-45a3c17ddd0f)
      </p>
      <div className={classes.inputWrapper}>
        <TextInput
          value={textInputValue}
          onChange={e => setTextInputValue(e.target.value.trim())}
          className={classes.input}
        />
        <Button onClick={() => lookupAvatar()}>Look Up</Button>
      </div>
    </div>
  )
}
