import React, { useState, useCallback, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useDropzone } from 'react-dropzone'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import CheckIcon from '@material-ui/icons/Check'
import PhotoIcon from '@material-ui/icons/Photo'

import useImageUpload from '../../hooks/useImageUpload'
import { handleError } from '../../error-handling'
import {
  FileTooLargeError,
  SecurityError,
  UnsupportedMimeTypeError,
  UploadImageError,
} from '../../file-uploading'

import FormControls from '../form-controls'
import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import InfoMessage from '../info-message'

const useStyles = makeStyles({
  root: {},
  dropzone: {
    border: '2px dashed rgba(255, 255, 255, 0.3)',
    borderRadius: '3px',
    padding: '2rem 0',
    textAlign: 'center',
    fontSize: '125%',
    fontWeight: 'bold',
    cursor: 'pointer',
    background: 'rgba(255, 255, 255, 0.1)',
  },
  draggingFile: {
    animation: '500ms $pulse infinite alternate',
  },
  cropper: {
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '3px',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.1)',
  },
  '@keyframes pulse': {
    from: {
      backgroundColor: 'rgba(255, 255, 255, 0)',
    },
    to: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > svg': {
      marginRight: '0.5rem',
    },
  },
})

const bytesToMegabytes = (bytes: number): string =>
  (bytes / 1024 / 1024).toFixed(1)

const getErrorMessageForLastError = (error: Error): string => {
  if (error instanceof FileTooLargeError) {
    return `The file is too large${
      error.maxSizeBytes
        ? ` (maximum ${bytesToMegabytes(error.maxSizeBytes)}mb${
            error.sizeBytes
              ? `, provided ${bytesToMegabytes(error.sizeBytes)}mb`
              : ''
          })`
        : ''
    }`
  }

  if (error instanceof SecurityError) {
    return `There was a problem with the security of uploading your file`
  }

  if (error instanceof UnsupportedMimeTypeError) {
    return `The file is not a valid filetype${
      error.allowedMimeTypes
        ? ` (${error.allowedMimeTypes
            .map((mimeType) => mimeType.replace('image/', ''))
            .join(', ')})`
        : ''
    }`
  }

  if (error instanceof UploadImageError) {
    return `${error.message} - code ${error.code}`
  }

  return 'Unknown error'
}

const convertFileToUrl = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => {
      if (!reader.result) {
        throw new Error('Cannot convert file to URL: result is null')
      }
      resolve(reader.result.toString())
    })

    reader.readAsDataURL(file)
  })
}

const cropImageToBlob = async (
  image: HTMLImageElement,
  cropSettings: Crop
): Promise<Blob> => {
  return new Promise((resolve) => {
    if (cropSettings.width === undefined || cropSettings.height === undefined) {
      throw new Error('Cannot crop image to blob without width and height')
    }
    if (cropSettings.x === undefined || cropSettings.y === undefined) {
      throw new Error('Cannot crop image to blob without t')
    }

    const canvas = document.createElement('canvas')
    canvas.width = cropSettings.width
    canvas.height = cropSettings.height

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Cannot crop image without a 2D context')
    }

    ctx.drawImage(
      image,
      cropSettings.x * scaleX,
      cropSettings.y * scaleY,
      cropSettings.width * scaleX,
      cropSettings.height * scaleY,
      0,
      0,
      cropSettings.width,
      cropSettings.height
    )

    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error(
          'Cannot crop image to blob: failed to convert canvas to blob'
        )
      }
      resolve(blob)
    })
  })
}

const Cropper = ({
  imageUrl,
  onDoneCropping,
  onCancel,
  requiredWidth = undefined,
  requiredHeight = undefined,
}: {
  imageUrl: string
  onDoneCropping: (image: HTMLImageElement, crop: Crop) => void
  onCancel: () => void
  requiredWidth?: number
  requiredHeight?: number
}) => {
  const imageRef = useRef<HTMLImageElement>()
  const throttleTimeoutRef = useRef<NodeJS.Timeout>()
  const onImageLoadedTimeoutRef = useRef<NodeJS.Timeout>()
  const [crop, setCrop] = useState<Crop>({
    aspect:
      requiredWidth && requiredHeight
        ? requiredWidth / requiredHeight
        : undefined,
  })
  const classes = useStyles()

  useEffect(() => {
    console.debug(`ImageUploader.Cropper.mount`, {
      imageUrl,
      requiredWidth,
      requiredHeight,
    })

    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
      }
      if (onImageLoadedTimeoutRef.current) {
        clearTimeout(onImageLoadedTimeoutRef.current)
      }
    }
  }, [])

  const onCrop = (newCrop: Crop) => {
    console.debug(`ImageUploader.Cropper.onCrop`, { oldCrop: crop, newCrop })
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current)
    }
    throttleTimeoutRef.current = setTimeout(
      () => setCrop((currentVal) => ({ ...currentVal, ...newCrop })),
      1
    )
  }

  return (
    <div className={classes.cropper}>
      <ReactCrop
        src={imageUrl}
        crossorigin="anonymous" // fix rendering itch.io thumbs
        onChange={(newCrop) => onCrop(newCrop)}
        ruleOfThirds
        onImageLoaded={(img) => {
          console.debug(`ImageUploader.Cropper.ReactCrop.onImageLoaded`, {
            img,
          })

          // store their image so we can use it later
          imageRef.current = img
          imageRef.current.crossOrigin = 'anonymous' // allow us to render cross-domain images like Gumroad

          // need this delay because it is needed apparently
          onImageLoadedTimeoutRef.current = setTimeout(() => {
            setCrop((currentVal) => ({
              ...currentVal,
              x: 0,
              y: 0,
              width:
                requiredWidth && img.width > requiredWidth
                  ? requiredWidth
                  : img.width,
              height:
                requiredHeight && img.height > requiredHeight
                  ? requiredHeight
                  : img.height,
            }))
          }, 50)
        }}
        crop={crop}
      />
      <FormControls>
        <Button
          onClick={() => {
            if (!imageRef.current) {
              throw new Error('Cannot call onDone callback without an image')
            }
            onDoneCropping(imageRef.current, crop)
          }}
          icon={<CheckIcon />}>
          Done
        </Button>{' '}
        <Button onClick={onCancel} color="default">
          Cancel
        </Button>
      </FormControls>
    </div>
  )
}

interface ImageInfo {
  url: string
  base64: string
  width: number
  height: number
}

const getImageInfo = async (file: File): Promise<ImageInfo> => {
  console.debug(`ImageUploader.getImageInfo`, { file })

  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file)

    const i = new Image()

    i.onload = () => {
      console.debug(`ImageUploader.getImageInfo.img.onload`)

      let reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = () => {
        console.debug(`ImageUploader.getImageInfo.reader.onload`, {
          result: reader.result,
        })

        if (reader.result === null) {
          reject(new Error('Result is null'))
          return
        }

        resolve({
          url: imageUrl,
          width: i.width,
          height: i.height,
          base64: reader.result.toString(),
        })
      }
    }

    i.src = imageUrl
  })
}

const ImageUploader = ({
  onDone,
  onCancel = undefined,
  bucketName,
  directoryPath = '', // root
  requiredWidth = undefined,
  requiredHeight = undefined,
  maxSizeBytes = undefined,
  allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp'],
  allowMultiple = false,
  allowCropping = true,
  preloadImageUrl = undefined,
  preloadFile = undefined,
  resetOnDone = false,
  children,
  clickToOpen = true,
}: {
  onDone: (urls: string[]) => void
  bucketName: string
  directoryPath?: string
  generateThumbnail?: boolean
  onCancel?: () => void
  // settings
  requiredWidth?: number
  requiredHeight?: number
  allowedMimeTypes?: string[]
  maxSizeBytes?: number
  allowMultiple?: boolean
  allowCropping?: boolean
  // for sync with gumroad
  preloadImageUrl?: string
  preloadFile?: File
  resetOnDone?: boolean
  clickToOpen?: boolean
  children?: any // (props: { triggerOpen: () => void }) => React.ReactElement
}) => {
  if (!onDone) {
    throw new Error('Need a onDone')
  }
  if (!bucketName) {
    throw new Error('Need a bucket name')
  }
  if (allowCropping && allowMultiple) {
    throw new Error('Cannot allow cropping and multiple files yet')
  }

  const selectedFileRef = useRef<File | null>(preloadFile || null)
  const [imageUrlToCrop, setImageUrlToCrop] = useState<string | null>(
    preloadImageUrl || null
  )
  const classes = useStyles()
  const [lastCustomError, setLastCustomError] = useState<Error | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.debug(`ImageUploader.onDrop`, { files: acceptedFiles })

    if (!acceptedFiles.length) {
      // no error here as it should be caught by onDropRejected
      console.warn('Accepted files is empty')
      return
    }

    if (allowCropping) {
      const file = acceptedFiles[0]
      selectedFileRef.current = file
      const imageInfo = await getImageInfo(file)
      console.debug(`ImageUploader.onDrop.imageinfo`, { imageInfo })
      setImageUrlToCrop(imageInfo.url)
    } else {
      const results: string[] = []

      console.debug(`Multi-upload of ${acceptedFiles.length} files`)

      for (const acceptedFile of acceptedFiles) {
        console.debug(`Uploading file "${acceptedFile.name}"...`)

        const optimizedUrl = await uploadImage(acceptedFile)

        results.push(optimizedUrl)
      }

      console.debug(`All files have been uploaded`)

      if (resetOnDone) {
        reset()
      }

      onDone(results)
    }
  }, [])
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    multiple: allowMultiple,
    onDrop,
    maxSize: maxSizeBytes,
    accept: allowedMimeTypes,
    noClick: !clickToOpen,
    onDropRejected: (fileRejections) => {
      console.error('Drop rejected', fileRejections)
      const firstRejection = fileRejections[0]
      const firstError = firstRejection.errors[0]

      switch (firstError.code) {
        case 'file-too-large':
          const error = new FileTooLargeError(
            `Drop rejected: ${firstError.message}`
          )
          error.sizeBytes = firstRejection.file.size
          error.maxSizeBytes = maxSizeBytes
          setLastCustomError(error)
          break
        default:
          setLastCustomError(new Error('Drop rejected'))
      }
    },
  })

  const [isUploading, percentageDone, lastError, , upload, clear] =
    useImageUpload()

  if (lastError || lastCustomError) {
    const error: Error = lastError || lastCustomError!
    return (
      <ErrorMessage
        onRetry={() => {
          setLastCustomError(null)
          clear()
        }}>
        Failed to upload image: {getErrorMessageForLastError(error)}
      </ErrorMessage>
    )
  }

  const uploadImage = async (fileToUpload: File): Promise<string> => {
    const uploadedUrl = await upload(fileToUpload, bucketName, directoryPath)

    if (resetOnDone) {
      reset()
    }

    return uploadedUrl
  }

  const onDoneCropping = async (
    image: HTMLImageElement,
    cropSettings: Crop
  ): Promise<void> => {
    try {
      console.debug(`ImageUploader.onDoneCropping`, { crop: cropSettings })

      const blob = await cropImageToBlob(image, cropSettings)

      const fileNameWithExt = selectedFileRef.current
        ? selectedFileRef.current.name
        : 'cropped.png'

      const fileToUpload = new File([blob], fileNameWithExt, {
        type: 'image/png',
      })

      const optimizedUrl = await uploadImage(fileToUpload)

      onDone([optimizedUrl])
    } catch (err) {
      console.error(err)
      handleError(err)

      setLastCustomError(err as Error)
    }
  }

  const reset = () => {
    setImageUrlToCrop(null)
    selectedFileRef.current = null

    if (onCancel) {
      onCancel()
    }
  }

  if (isUploading) {
    return (
      <LoadingIndicator
        message={`Uploading image (${percentageDone.toFixed(1)}%)...`}
      />
    )
  }

  if (imageUrlToCrop) {
    return (
      <Cropper
        imageUrl={imageUrlToCrop}
        onDoneCropping={onDoneCropping}
        onCancel={() => reset()}
        requiredWidth={requiredWidth}
        requiredHeight={requiredHeight}
      />
    )
  }

  return (
    <div className={classes.root}>
      <div
        {...getRootProps()}
        className={`${children ? '' : classes.dropzone} ${
          isDragActive ? `${classes.dropzone} ${classes.draggingFile}` : ''
        }`}>
        <input {...getInputProps()} />
        <div className={classes.message}>
          {isDragActive ? (
            <>Drop your image here!</>
          ) : children ? (
            React.createElement(children, { triggerOpen: open })
          ) : (
            <>
              <PhotoIcon /> Drag and drop your image{allowMultiple ? 's' : ''}{' '}
              here or click here
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageUploader
