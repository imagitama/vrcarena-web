import { useState } from 'react'
import { handleError } from '../error-handling'
import { uploadImage } from '../file-uploading'

type UploadFunc = (
  file: File,
  bucketName: string,
  bucketDirectoryPath?: string
) => Promise<string>

const useImageUpload = (): [
  boolean | null,
  number,
  Error | null,
  string,
  UploadFunc,
  () => void
] => {
  const [isUploading, setIsUploading] = useState<boolean | null>(null)
  const [percentageDone, setPercentageDone] = useState(0)
  const [lastError, setLastError] = useState<Error | null>(null)
  const [downloadUrl, setDownloadUrl] = useState('')

  const upload: UploadFunc = async (
    file,
    bucketName,
    bucketDirectoryPath = ''
  ) => {
    setIsUploading(true)
    setPercentageDone(0)
    setLastError(null)
    setDownloadUrl('')

    try {
      const url = await uploadImage(
        file,
        bucketName,
        bucketDirectoryPath,
        (progressPercentage) => setPercentageDone(progressPercentage)
      )

      setIsUploading(false)
      setPercentageDone(100)
      setLastError(null)
      setDownloadUrl(url)

      return url
    } catch (err) {
      console.error(err)
      handleError(err)

      setIsUploading(false)
      setPercentageDone(0)
      setLastError(err as Error)
      setDownloadUrl('')

      throw err
    }
  }

  const clear = () => {
    setIsUploading(false)
    setPercentageDone(0)
    setLastError(null)
    setDownloadUrl('')
  }

  return [isUploading, percentageDone, lastError, downloadUrl, upload, clear]
}

export default useImageUpload
