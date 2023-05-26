import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { callFunction } from '../../firebase'
import { handleError } from '../../error-handling'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'
import FormControls from '../form-controls'
import TextInput from '../text-input'

// source: https://stackoverflow.com/a/66405602/1215393
const getVideoIdFromYouTubeUrl = url =>
  url.match(
    /(?:https?:\/\/)?(?:www\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\/?\?v=|\/embed\/|\/)([^\s&]+)/
  )[1]

const useStyles = makeStyles({
  input: { width: '100%' }
})

export default ({ onDone, onCancel }) => {
  const [youTubeVideoUrl, setYouTubeVideoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const classes = useStyles()

  const onClickGetYouTubeVideoBtn = async () => {
    try {
      if (!youTubeVideoUrl) {
        return
      }

      setIsLoading(true)
      setIsError(false)

      const videoId = getVideoIdFromYouTubeUrl(youTubeVideoUrl)

      // https://developers.google.com/youtube/v3/docs/videos#snippet
      const { data: result } = await callFunction('getYouTubeVideoMeta', {
        videoId
      })

      setIsLoading(false)
      setIsError(false)

      onDone({ url: youTubeVideoUrl, ...result })
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsLoading(false)
      setIsError(true)
    }
  }

  if (isLoading) {
    return <LoadingIndicator message="Fetching video details..." />
  }

  if (isError) {
    return (
      <ErrorMessage>
        Failed to fetch the video details.
        <br />
        <br />
        <Button onClick={() => setIsError(false)} color="default">
          Try Again
        </Button>
      </ErrorMessage>
    )
  }

  return (
    <>
      <Heading variant="h2">YouTube Video</Heading>
      <p>Enter the YouTube video URL below:</p>
      <TextInput
        className={classes.input}
        value={youTubeVideoUrl}
        onChange={e => setYouTubeVideoUrl(e.target.value)}
      />
      <FormControls>
        <Button onClick={onClickGetYouTubeVideoBtn}>Continue</Button>{' '}
        <Button onClick={() => onCancel()} color="default">
          Cancel
        </Button>
      </FormControls>
    </>
  )
}
