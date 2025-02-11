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
import { VrchatAvatar as VrchatAvatarDetails } from '../../vrchat'

const useStyles = makeStyles({
  label: {
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  },
  inputWrapper: {
    width: '100%',
    display: 'flex',
  },
  input: {
    flex: 1,
    marginRight: '0.5rem',
  },
})

// copied from backend
enum ErrorCode {
  AvatarNotFound = 'AvatarNotFound',
  Unknown = 'Unknown',
}

const GetVrchatAvatarDetails = ({
  onDone,
}: {
  onDone?: (
    avatarId: string,
    avatarData: VrchatAvatarDetails,
    retry: () => void
  ) => void
}) => {
  const [textInputValue, setTextInputValue] = useState('')
  const [avatarId, setAvatarId] = useState('')
  const classes = useStyles()
  const [isGettingAvatar, setIsGettingAvatar] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode>(null)
  const [avatarData, setAvatarData] = useState<null | VrchatAvatarDetails>(null)

  const lookupAvatar = async () => {
    try {
      const avatarIdFromUserInput = getAvatarIdFromUserInput(textInputValue)

      if (!avatarIdFromUserInput) {
        console.warn('Could not find avatar ID from user input', {
          textInputValue,
        })
        return
      }

      setAvatarId(avatarIdFromUserInput)
      setIsGettingAvatar(true)
      setLastErrorCode(null)
      setAvatarData(null)

      // NOTE: This function also dumps it into a cache for later retrieval
      const {
        data: { avatar, errorCode },
      } = await callFunction<
        { avatarId: string },
        { avatar: VrchatAvatarDetails; errorCode?: ErrorCode }
      >('getVrchatAvatarDetails', {
        avatarId: avatarIdFromUserInput,
      })

      if (errorCode) {
        setIsGettingAvatar(false)
        setLastErrorCode(errorCode)
        return
      }

      setIsGettingAvatar(false)
      setLastErrorCode(null)
      setAvatarData(avatar)
    } catch (err) {
      console.error(err)
      handleError(err)

      setIsGettingAvatar(false)
      setLastErrorCode(ErrorCode.Unknown)
    }
  }

  const retry = () => {
    setAvatarId('')
    setIsGettingAvatar(false)
    setLastErrorCode(null)
    setAvatarData(null)
  }

  if (isGettingAvatar) {
    return <LoadingIndicator message="Looking up VRChat avatar..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to get VRChat avatar. Error code: {lastErrorCode}
        <br />
        <br />
        Are you sure the VRChat avatar exists? Please try again later.
        <br />
        <br />
        <Button onClick={retry}>Try Again</Button>
      </ErrorMessage>
    )
  }

  if (avatarData) {
    return (
      <div>
        <VrchatAvatar avatarId={avatarData.id} avatarData={avatarData} />
        <FormControls>
          {onDone ? (
            <Button onClick={() => onDone(avatarId, avatarData, retry)}>
              Done
            </Button>
          ) : null}{' '}
          <Button onClick={retry} color="default">
            Retry
          </Button>
        </FormControls>
      </div>
    )
  }

  return (
    <div>
      <div className={classes.inputWrapper}>
        <TextInput
          label="Enter the URL of the avatar or the avatar ID"
          placeholder="eg. avtr_69f1893b-2d7c-4d19-beb4-45a3c17ddd0f"
          value={textInputValue}
          onChange={(e) => setTextInputValue(e.target.value.trim())}
          className={classes.input}
          fullWidth
        />
        <Button onClick={() => lookupAvatar()}>Look Up</Button>
      </div>
    </div>
  )
}

export default GetVrchatAvatarDetails
