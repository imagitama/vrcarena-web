import React, { useState } from 'react'
import ReactPlayer from 'react-player'
import { BaseReactPlayerProps } from 'react-player/base'
import { handleError } from '../../error-handling'

const errorStates = {
  ABORTED: 'aborted',
  NETWORK: 'network',
  DECODE: 'decode',
  SRC_NOT_SUPPORTED: 'srcNotSupported',
  UNKNOWN: 'unknown',
}

function getErrorStateForEvent(e: any): string {
  if (!e || !e.target) {
    return errorStates.UNKNOWN
  }
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

function getLabelForErrorState(errorState: string): string {
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

export default ({
  url,
  onPlay = undefined,
  config = {},
  ...otherProps
}: {
  url: string
  autoplay?: boolean
  onPlay?: () => void
} & BaseReactPlayerProps) => {
  const [errorState, setErrorState] = useState<string | null>(null)

  const configToUse = {
    ...config,
    youtube: {
      height: '1080px',
      ...(config.youtube || {}),
      playerVars: {
        ...((config.youtube || {}).playerVars || {}),
        autoplay: 1,
      },
    },
    file: {
      ...(config.file || {}),
      attributes: {
        ...((config.file || {}).attributes || {}),
        autoPlay: true,
      },
    },
  }

  return (
    <>
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
        onError={(e) => {
          handleError(e.target.error)
          console.error(e.target.error)
          setErrorState(getErrorStateForEvent(e))
        }}
        playing={true}
        playsinline={true}
        config={configToUse}
        {...otherProps}
      />
      {errorState &&
        `An error has occured playing the video: ${getLabelForErrorState(
          errorState
        )}`}
    </>
  )
}
