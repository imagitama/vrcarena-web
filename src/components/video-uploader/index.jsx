import React, { useState } from 'react'
import { callFunction } from '../../firebase'
import { handleError } from '../../error-handling'
import FileUploader from '../firebase-file-uploader'

const generateThumbnail = async videoUrl => {
  const {
    data: { thumbnailUrl }
  } = await callFunction('generateThumbnail', {
    videoUrl
  })
  return thumbnailUrl
}

export default ({ withThumbnail = false, ...props }) => {
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false)
  const [isError, setIsError] = useState(false)

  const onFileUploaderDone = async videoUrl => {
    try {
      if (!withThumbnail) {
        props.onUploadedUrl(videoUrl)
        return
      }

      setIsGeneratingThumbnail(true)

      const thumbnailUrl = await generateThumbnail(videoUrl)

      setIsGeneratingThumbnail(false)

      props.onUploadedUrl(videoUrl, thumbnailUrl)
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsError(true)
    }
  }

  if (isGeneratingThumbnail) {
    return 'Generating thumbnail...'
  }

  if (isError) {
    return 'Error generating a thumbnail - please try again later'
  }

  return (
    <FileUploader
      mimeTypes={['video/mp4', 'video/webm']}
      onDownloadUrl={onFileUploaderDone}
      {...props}
    />
  )
}
