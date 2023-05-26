import React, { useState } from 'react'
import ReactPlayer from 'react-player'
import { handleError } from '../../error-handling'

const errorStates = {
  ABORTED: 'aborted',
  NETWORK: 'network',
  DECODE: 'decode',
  SRC_NOT_SUPPORTED: 'srcNotSupported',
  UNKNOWN: 'unknown'
}

function getErrorStateForEvent(e) {
  switch (e.target.error.code) {
    case e.target.error.MEDIA_ERR_ABORTED:
      return errorStates.ABORTED
    case e.target.error.MEDIA_ERR_NETWORK:
      return errorStates.NETWORK
    case e.target.error.MEDIA_ERR_DECODE:
      return errorStates.DECODE
    case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return errorStates.SRC_NOT_SUPPORTED
    default:
      return errorStates.UNKNOWN
  }
}

function getLabelForErrorState(errorState) {
  switch (errorState) {
    case errorStates.ABORTED:
      return 'you aborted the playback'
    case errorStates.NETWORK:
      return 'you lost connection to the server'
    case errorStates.DECODE:
      return 'failed to decode the video or audio'
    case errorStates.SRC_NOT_SUPPORTED:
      return 'the file type is not supported'
    case errorStates.UNKNOWN:
      return 'an unknown error has happened'
    default:
      return 'an unknown error'
  }
}

export default ({ url, onPlay = null, ...otherProps }) => {
  const [errorState, setErrorState] = useState(null)

  return (
    <>
      {' '}
      <ReactPlayer
        light
        url={url}
        controls
        onPlay={() => {
          console.debug(`Playing "${url}"`)
          if (onPlay) {
            onPlay()
          }
        }}
        onError={e => {
          handleError(e.target.error)
          console.error(e.target.error)
          setErrorState(getErrorStateForEvent(e))
        }}
        playing={true}
        {...otherProps}
      />
      {errorState &&
        `An error has occured playing the video: ${getLabelForErrorState(
          errorState
        )}`}
    </>
  )
}
