import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'

import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import { isUrl } from '../../utils'

import FormControls from '../form-controls'
import TextInput from '../text-input'
import Button from '../button'
import VrchatWorld from '../vrchat-world'
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

const getWorldIdFromUserInput = userInput => {
  if (isUrl(userInput)) {
    return userInput
      .split('?')[0]
      .split('/')
      .pop()
  }
  return userInput
}

export default ({ onDone }) => {
  const [textInputValue, setTextInputValue] = useState('')
  const [worldId, setWorldId] = useState('')
  const classes = useStyles()
  const [isGettingWorld, setIsGettingWorld] = useState(false)
  const [didFailGettingWorld, setDidFailGettingWorld] = useState(false)
  const [worldData, setWorldData] = useState(null)

  const lookupWorld = async () => {
    try {
      const worldIdFromUserInput = getWorldIdFromUserInput(textInputValue)

      if (!worldIdFromUserInput) {
        return
      }

      setWorldId(worldIdFromUserInput)
      setIsGettingWorld(true)
      setDidFailGettingWorld(false)
      setWorldData(null)

      // NOTE: This function also dumps it into a cache for later retrieval
      const {
        data: { world }
      } = await callFunction('getVrchatWorldDetails', {
        worldId: worldIdFromUserInput
      })

      setIsGettingWorld(false)
      setDidFailGettingWorld(false)
      setWorldData(world)
    } catch (err) {
      console.error(err)
      handleError(err)

      setIsGettingWorld(false)
      setDidFailGettingWorld(true)
    }
  }

  const retry = () => {
    setWorldId('')
    setIsGettingWorld(false)
    setDidFailGettingWorld(false)
    setWorldData(null)
  }

  if (isGettingWorld) {
    return <LoadingIndicator message="Looking up VRChat world..." />
  }

  if (didFailGettingWorld) {
    return (
      <ErrorMessage>
        Failed to find world. Please verify the world ID. There might be an
        issue communicating with VRChat
        <br />
        <br />
        <Button onClick={retry}>Try Again</Button>
      </ErrorMessage>
    )
  }

  if (worldData) {
    return (
      <div>
        <VrchatWorld worldData={worldData} />
        <FormControls>
          <Button onClick={() => onDone(worldId, worldData, retry)}>
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
        Enter the URL of the world or the world ID: (eg.
        wrld_7eaca96a-60dd-4428-9ead-42814cefe1ff)
      </p>
      <div className={classes.inputWrapper}>
        <TextInput
          value={textInputValue}
          onChange={e => setTextInputValue(e.target.value.trim())}
          className={classes.input}
        />
        <Button onClick={() => lookupWorld()}>Look Up</Button>
      </div>
    </div>
  )
}
