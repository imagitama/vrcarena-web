import React, { useState } from 'react'
import { getIsUrl, getIsUrlAVideo, getIsUrlAYoutubeVideo } from '../../utils'
import Button from '../button'
import FormControls from '../form-controls'
import TextInput from '../text-input'
import VideoPlayer from '../video-player'
import YoutubePlayer from '../youtube-player'

const types = {
  YOUTUBE_VIDEO: 'youtube-video',
  VIDEO: 'video',
  OTHER: 'other',
}

export default ({
  label = 'URL',
  existingUrl,
  onDone,
  onChange,
}: {
  label?: string
  existingUrl?: string
  onDone?: (url: string) => void
  onChange?: (url: string) => void
}) => {
  const [textInput, setTextInput] = useState(existingUrl || '')
  const [finalUrl, setFinalUrl] = useState('')
  const [type, setType] = useState<string | null>(null)

  const proceedWithUrl = () => {
    if (!textInput) {
      console.warn(`Text input is empty`)
      return
    }

    const cleanedUpUrl = textInput.trim()

    if (!getIsUrl(cleanedUpUrl)) {
      console.warn(`Text input is not a URL: ${cleanedUpUrl}`)
      return
    }

    setFinalUrl(cleanedUpUrl)

    if (getIsUrlAYoutubeVideo(cleanedUpUrl)) {
      setType(types.YOUTUBE_VIDEO)
    } else if (getIsUrlAVideo(cleanedUpUrl)) {
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
        label={label}
        fullWidth
        value={textInput}
        onChange={(e) => {
          setTextInput(e.target.value)
          if (onChange) {
            onChange(e.target.value)
          }
        }}
        placeholder="Enter a URL"
      />
      {onDone && (
        <FormControls>
          <Button
            isDisabled={textInput === ''}
            onClick={() => proceedWithUrl()}>
            Proceed
          </Button>
        </FormControls>
      )}
    </div>
  )
}
