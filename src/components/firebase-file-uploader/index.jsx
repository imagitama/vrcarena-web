import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'

import useFileUpload from '../../hooks/useFirebaseFileUpload'
import Button from '../button'
import { handleError } from '../../error-handling'

const useStyles = makeStyles({
  container: {
    position: 'relative'
  },
  input: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 100
  }
})

export default ({
  onDownloadUrl,
  directoryPath = '',
  filePrefix = '',
  children,
  mimeTypes = [],
  onCancel = null
}) => {
  const [isUploading, percentageDone, , , upload] = useFileUpload()
  const classes = useStyles()
  const [currentFile, setCurrentFile] = useState(null)

  const onFileChange = files => {
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
      const pathToUpload = `${directoryPath}/${
        filePrefix ? `${filePrefix}___` : ''
      }${currentFile.name}`

      console.debug(`Uploading file "${pathToUpload}"`)

      const url = await upload(currentFile, pathToUpload)

      onDownloadUrl(url)
    } catch (err) {
      console.error('Failed to upload file', err)
      handleError(err)
    }
  }

  if (isUploading || (percentageDone > 0 && percentageDone < 100)) {
    return `Uploading ${parseInt(percentageDone)}%`
  }

  if (children) {
    return (
      <div className={classes.container}>
        <input
          className={classes.input}
          type="file"
          onChange={event => onFileChange(event.target.files)}
          multiple={false}
          accept={mimeTypes.join(',')}
        />
        {children}
      </div>
    )
  }

  return (
    <>
      <input
        type="file"
        onChange={event => onFileChange(event.target.files)}
        multiple={false}
        accept={mimeTypes.join(',')}
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
