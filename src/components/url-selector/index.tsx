import React, { useState } from 'react'
import { isUrl, isUrlAVideo, isUrlAYoutubeVideo } from '../../utils'
import Button from '../button'
import FormControls from '../form-controls'
import TextInput from '../text-input'
import VideoPlayer from '../video-player'
import YoutubePlayer from '../youtube-player'

const types = {
  YOUTUBE_VIDEO: 'youtube-video',
  VIDEO: 'video',
  OTHER: 'other'
}

export default ({ onDone }: { onDone: (url: string) => void }) => {
  const [textInput, setTextInput] = useState('')
  const [finalUrl, setFinalUrl] = useState('')
  const [type, setType] = useState<string | null>(null)

  const proceedWithUrl = () => {
    if (!textInput) {
      console.warn(`Text input is empty`)
      return
    }

    const cleanedUpUrl = textInput.trim()

    if (!isUrl(cleanedUpUrl)) {
      console.warn(`Text input is not a URL: ${cleanedUpUrl}`)
      return
    }

    setFinalUrl(cleanedUpUrl)

    if (isUrlAYoutubeVideo(cleanedUpUrl)) {
      setType(types.YOUTUBE_VIDEO)
    } else if (isUrlAVideo(cleanedUpUrl)) {
      setType(types.VIDEO)
    } else {
      setType(types.OTHER)
    }
  }

  const finish = () => {
    if (onDone) {
      onDone(finalUrl)
    }
  }

  const cancel = () => {
    setType(null)
    setFinalUrl('')
  }

  if (type) {
    const cleanedUpUrl = textInput.trim()

    return (
      <div>
        {type === types.YOUTUBE_VIDEO ? (
          <YoutubePlayer url={cleanedUpUrl} width="100%" />
        ) : type === types.VIDEO ? (
          <VideoPlayer url={cleanedUpUrl} />
        ) : (
          <>{finalUrl}</>
        )}
        <FormControls>
          <Button onClick={() => finish()}>This Is Correct</Button>{' '}
          <Button color="default" onClick={() => cancel()}>
            Try Again
          </Button>
        </FormControls>
      </div>
    )
  }

  return (
    <div>
      <TextInput
        fullWidth
        value={textInput}
        onChange={e => setTextInput(e.target.value)}
        placeholder="Paste a URL"
      />
      <FormControls>
        <Button isDisabled={textInput === ''} onClick={() => proceedWithUrl()}>
          Proceed
        </Button>
      </FormControls>
    </div>
  )
}
