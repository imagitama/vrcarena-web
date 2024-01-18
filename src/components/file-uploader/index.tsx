import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'

import useFileUpload from '../../hooks/useFileUpload'
import Button from '../button'
import { handleError } from '../../error-handling'

const useStyles = makeStyles({
  container: {
    position: 'relative',
  },
  input: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 100,
  },
})

export default ({
  onDone,
  bucketName,
  directoryPath,
  children = undefined,
  allowedMimeTypes = [],
  onCancel = undefined,
  onError = undefined,
}: {
  onDone: (url: string) => void
  bucketName: string
  directoryPath: string
  children?: React.ReactChild
  allowedMimeTypes?: string[]
  onCancel?: () => void
  onError?: (err: Error) => void
}) => {
  const [isUploading, percentageDone, , , upload] = useFileUpload()
  const classes = useStyles()
  const [currentFile, setCurrentFile] = useState<File | null>(null)

  const onFileChange = (files: FileList | null) => {
    if (!files) {
      return
    }

    setCurrentFile(files[0])

    if (children) {
      onUploadClick()
    }
  }

  const onUploadClick = async () => {
    if (!currentFile) {
      console.warn('You clicked upload but there were no files selected')
      return
    }

    try {
      const pathToUpload = `${directoryPath}/${currentFile.name}`

      const url = await upload(currentFile, bucketName, pathToUpload)

      onDone(url)
    } catch (err) {
      console.error('Failed to upload file', err)
      handleError(err)
      if (onError) {
        onError(err as Error)
      }
    }
  }

  if (isUploading || (percentageDone > 0 && percentageDone < 100)) {
    return <>Uploading {percentageDone}%</>
  }

  if (children) {
    return (
      <div className={classes.container}>
        <input
          className={classes.input}
          type="file"
          onChange={(event) => onFileChange(event.target.files)}
          multiple={false}
          accept={allowedMimeTypes.join(',')}
        />
        {children}
      </div>
    )
  }

  return (
    <>
      <input
        type="file"
        onChange={(event) => onFileChange(event.target.files)}
        multiple={false}
        accept={allowedMimeTypes.join(',')}
      />
      <br />
      <br />
      <Button
        onClick={onUploadClick}
        isDisabled={!currentFile}
        icon={<CloudUploadIcon />}>
        Upload
      </Button>{' '}
      {onCancel && (
        <Button onClick={onCancel} color="default">
          Cancel
        </Button>
      )}
    </>
  )
}
