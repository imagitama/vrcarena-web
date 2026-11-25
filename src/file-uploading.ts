import { client } from '@/supabase'
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
    `uploading ${file.name} to bucket '${bucketName}' path '${fullPathToUploadTo}'...`
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

  const { publicUrl: url } = data

  // console.debug(`file uploaded to ${url}`)

  return url
}

export class FileUploadError extends Error {}

export const uploadImage = async (
  file: File,
  bucketName: string,
  pathInsideBucket: string = '',
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    console.debug('uploadImage')

    const webpFile = await convertImageToWebp(file)

    const fileNameWithExt = webpFile.name

    console.debug('uploadImage.webp', { webpFile, pathInsideBucket })

    const fullPathInsideBucket = `${
      pathInsideBucket ? `${pathInsideBucket}/` : ''
    }${fileNameWithExt}`

    return uploadFile(webpFile, bucketName, fullPathInsideBucket, onProgress)
  } catch (err) {
    console.error(err)
    throw new FileUploadError()
  }
}

export async function convertImageToWebp(file: File): Promise<File> {
  if (file.type === 'image/webp') return file

  const bitmap = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.85)
  )

  // some browsers (older Safari) silently fall back to PNG
  if (!blob || blob.type !== 'image/webp') throw new Error('Blob is not a webp')

  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', {
    type: 'image/webp',
    lastModified: Date.now(),
  })
}
