import { callFunction, callFunctionWithFile } from './firebase'
import { client } from './supabase'
import { v4 as uuidv4 } from 'uuid'

const getFilenameWithoutExtension = (filename: string): string =>
  filename.split('.').slice(0, -1).join('.')

export const getFullPathButWithUuidFilename = (
  filename: string,
  fullPath: string
): string => {
  const filenameWithoutExt = getFilenameWithoutExtension(filename)

  const chunks = fullPath.split('/')

  const lastChunk = chunks[chunks.length - 1]

  const newLastChunk = lastChunk.replace(filenameWithoutExt, uuidv4())

  const newFullPath = chunks.slice(0, -1).concat(newLastChunk).join('/')

  return newFullPath
}

export const maxThumbnailAndAvatarSizeBytes = 2097152

export class FileTooLargeError extends Error {
  sizeBytes?: number // size of the provided file
  maxSizeBytes?: number
}
export class UnsupportedMimeTypeError extends Error {
  allowedMimeTypes?: string[]
}
export class SecurityError extends Error {}

interface SupabaseStorageError {
  error: string
}

export const uploadFile = async (
  file: File,
  bucketName: string,
  fullPathInsideBucket: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (!(file instanceof File)) {
    throw new Error('Need a file')
  }
  if (!bucketName) {
    throw new Error('Need a bucket name')
  }
  if (!fullPathInsideBucket) {
    throw new Error('Need a full path inside bucket')
  }

  console.debug(`uploadFile`, { file, bucketName, fullPathInsideBucket })

  let fakeProgressPercentage = 0

  // supabase client does not expose a progress callback so we will fake it until they add it
  const fakeProgressLoop = setInterval(() => {
    if (fakeProgressPercentage < 90) {
      fakeProgressPercentage += 1

      if (onProgress) {
        onProgress(fakeProgressPercentage)
      }
    }
  }, 50)

  // our storage backend cannot generate UUIDs but it does enforce it
  const fullPathInsideBucketAsUuid = getFullPathButWithUuidFilename(
    file.name,
    fullPathInsideBucket
  )

  const fullPathToUploadTo = fullPathInsideBucketAsUuid

  console.debug(
    `Uploading ${file.name} to ${bucketName}/${fullPathToUploadTo}...`
  )

  const { error } = await client.storage
    .from(bucketName)
    .upload(fullPathToUploadTo, file, {
      upsert: false,
    })

  clearInterval(fakeProgressLoop)

  if (error) {
    if (error.message.includes('new row violates row-level security policy')) {
      throw new SecurityError()
    }

    if (
      (error as unknown as SupabaseStorageError).error === 'invalid_mime_type'
    ) {
      throw new UnsupportedMimeTypeError()
    }

    throw error
  }

  const { data } = client.storage
    .from(bucketName)
    .getPublicUrl(fullPathToUploadTo)

  if (!data) {
    throw new Error('Could not get public URL: no data')
  }

  const { publicURL: url } = data

  console.debug(`File uploaded to ${url}`)

  return url
}

enum ErrorCodes {
  Unknown = 0,
  MissingField = 1,
  FailedToRetrieveFile = 2,
  FailedToOptimize = 3,
  FailedToUpload = 4,
}

export class UploadImageError extends Error {
  code: ErrorCodes | null
  constructor(message: string, code: ErrorCodes | null) {
    super(message)
    this.code = code
  }
}

export const uploadImage = async (
  image: File,
  bucketName: string,
  bucketDirectoryPath: string = '', // default to root
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (!(image instanceof File)) {
    throw new Error('Need a file')
  }
  if (!bucketName) {
    throw new Error('Need a bucket name')
  }

  console.debug(`uploadImage`, { image, bucketName, bucketDirectoryPath })

  let fakeProgressPercentage = 0

  // supabase client does not expose a progress callback so we will fake it until they add it
  const fakeProgressLoop = setInterval(() => {
    if (fakeProgressPercentage < 90) {
      fakeProgressPercentage += 1

      if (onProgress) {
        onProgress(fakeProgressPercentage)
      }
    }
  }, 50)

  const {
    data: { imageUrl, error: errorMessage, code },
  } = await callFunctionWithFile<{
    imageUrl: string
    error?: string
    code?: number | null
  }>('uploadImage', image, {
    bucketName,
    bucketDirectoryPath,
  })

  clearInterval(fakeProgressLoop)

  if (errorMessage) {
    throw new UploadImageError(errorMessage, code || null)
  } else {
    console.debug(`File uploaded to ${imageUrl}`)
  }

  return imageUrl
}

export const bucketNames = {
  assetThumbnails: 'asset-thumbnails',
  userAvatars: 'user-avatars',
  attachments: 'attachments',
  assetBanners: 'asset-banners',
  amendmentThumbnails: 'amendment-thumbnails',
  amendmentBanners: 'amendment-banners',
  speciesThumbnails: 'species-thumbnails',
  authorAvatars: 'author-avatars',
  authorBanners: 'author-banners',
  playlistThumbnails: 'playlist-thumbnails',
  eventThumbnails: 'event-thumbnails',
  eventBanners: 'event-banners',
  socialPostAttachments: 'socialpost-attachments',
  authorPromos: 'author-promos',
  temp: 'temp',
}
