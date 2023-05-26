import React, { useState, useCallback, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useDropzone } from 'react-dropzone'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import CheckIcon from '@material-ui/icons/Check'
import PhotoIcon from '@material-ui/icons/Photo'
import shortid from 'shortid'

import { callFunction } from '../../firebase'
import { usingEmulator } from '../../environment'
import useFileUpload from '../../hooks/useFirebaseFileUpload'

import FormControls from '../form-controls'
import Button from '../button'
import LoadingIndicator from '../loading-indicator'

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
    background: 'rgba(255, 255, 255, 0.1)'
  },
  draggingFile: {
    animation: '500ms $pulse infinite alternate'
  },
  cropper: {
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '3px',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.1)'
  },
  '@keyframes pulse': {
    from: {
      backgroundColor: 'rgba(255, 255, 255, 0)'
    },
    to: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)'
    }
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': {
      marginRight: '0.5rem'
    }
  }
})

const getErrorMessageForCode = (errorCode: string): string => {
  switch (errorCode) {
    default:
      return 'Unknown error'
  }
}

const convertFileToUrl = async (file: File): Promise<string> => {
  return new Promise(resolve => {
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

const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (!reader.result) {
        throw new Error('Could not convert blob to base64: reader is empty')
      }
      resolve(reader.result.toString())
    }
    reader.readAsDataURL(blob)
  })
}

const cropImageToBlob = async (
  image: HTMLImageElement,
  cropSettings: Crop
): Promise<Blob> => {
  return new Promise(resolve => {
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

    canvas.toBlob(blob => {
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
  requiredHeight = undefined
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
        : undefined
  })
  const classes = useStyles()

  useEffect(() => {
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
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current)
    }
    throttleTimeoutRef.current = setTimeout(
      () => setCrop(currentVal => ({ ...currentVal, ...newCrop })),
      1
    )
  }

  return (
    <div className={classes.cropper}>
      <ReactCrop
        src={imageUrl}
        onChange={newCrop => onCrop(newCrop)}
        ruleOfThirds
        onImageLoaded={img => {
          // store their image so we can use it later
          imageRef.current = img
          imageRef.current.crossOrigin = 'anonymous' // allow us to render cross-domain images like Gumroad

          // need this delay because it is needed apparently
          onImageLoadedTimeoutRef.current = setTimeout(() => {
            setCrop(currentVal => ({
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
                  : img.height
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

// TODO: Why do we do this lol
function renameFileExtToPng(url: string): string {
  return url
    .replace('.jpeg', '.png')
    .replace('.jpg', '.png')
    .replace('.webp', '.png')
}

export default ({
  onUploadedWithUrl,
  directoryPath,
  requiredWidth = undefined,
  requiredHeight = undefined,
  filePrefix = undefined,
  generateFilePrefix = false,
  generateThumbnail = false,
  // for sync with gumroad
  preloadImageUrl = undefined,
  preloadFile = undefined,
  skipEmulator = false
}: {
  onUploadedWithUrl: (url: string, thumbnailUrl?: string) => void
  directoryPath: string
  requiredWidth?: number
  requiredHeight?: number
  filePrefix?: string
  generateFilePrefix?: boolean
  generateThumbnail?: boolean
  preloadImageUrl?: string
  preloadFile?: File
  skipEmulator?: boolean
}) => {
  if (!onUploadedWithUrl) {
    throw new Error('Need a onUploadedWithUrl')
  }
  if (!directoryPath) {
    throw new Error('Need a directoryPath')
  }

  const selectedFileRef = useRef<File | null>(preloadFile || null)
  const [imageUrlToCrop, setImageUrlToCrop] = useState<string | null>(
    preloadImageUrl || null
  )
  const [errorCode, setErrorCode] = useState(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const classes = useStyles()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    selectedFileRef.current = file
    const imageUrl = await convertFileToUrl(file)
    setImageUrlToCrop(imageUrl)
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/png,image/jpeg,image/webp'
  })
  // @ts-ignore
  const [isUploading, percentageDone, , , upload]: [
    boolean,
    number,
    string,
    boolean,
    (file: File | string, path: string) => Promise<void>
  ] = useFileUpload(skipEmulator)

  if (errorCode) {
    return <div>{getErrorMessageForCode(errorCode)}</div>
  }

  const onDoneCropping = async (
    image: HTMLImageElement,
    cropSettings: Crop
  ): Promise<void> => {
    const blob = await cropImageToBlob(image, cropSettings)

    if (!selectedFileRef.current) {
      throw new Error('Cannot continue without a selected file')
    }

    const filePrefixToUse =
      generateFilePrefix === true ? shortid.generate() : filePrefix
    const filename = `${
      filePrefixToUse ? `${filePrefixToUse}___` : ''
    }${renameFileExtToPng(selectedFileRef.current.name)}`
    const fileToUpload = new File([blob], filename)

    const uploadPath = `${directoryPath}/${filename}`

    console.debug(`Uploading ${uploadPath}...`)

    const uploadedUrl = usingEmulator()
      ? await blobToBase64(blob)
      : // @ts-ignore
        await upload(fileToUpload, uploadPath)

    setIsOptimizing(true)

    const {
      data: { optimizedUrl: optimizedImageUrl, thumbnailUrl }
    } = await callFunction('optimizeFirebaseImage', {
      imageUrl: uploadedUrl,
      bucketPath: usingEmulator() ? uploadPath.replace('.png', '.webp') : '',
      generateThumbnail
    })

    selectedFileRef.current = null
    setIsOptimizing(false)
    setImageUrlToCrop(null)

    onUploadedWithUrl(optimizedImageUrl, thumbnailUrl)
  }

  const reset = () => {
    setImageUrlToCrop(null)
    setErrorCode(null)
    selectedFileRef.current = null
  }

  if (isUploading) {
    return (
      <div>
        <LoadingIndicator
          message={`Uploading image (${percentageDone.toFixed(1)}%)...`}
        />
      </div>
    )
  }

  if (isOptimizing) {
    return (
      <div>
        <LoadingIndicator message="Optimizing image (takes 15-30 seconds)..." />
      </div>
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
        className={`${classes.dropzone} ${
          isDragActive ? classes.draggingFile : ''
        }`}>
        <input {...getInputProps()} />
        <div className={classes.message}>
          {isDragActive ? (
            <>Drop your image here!</>
          ) : (
            <>
              <PhotoIcon /> Drag and drop your image here or click here
            </>
          )}
        </div>
      </div>
    </div>
  )
}
