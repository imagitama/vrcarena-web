import { callFunction } from './firebase'

export const optimizeImageByUrl = async (
  imageUrl: string,
  bucketName: string,
  bucketPath: string
): Promise<string> => {
  const {
    data: { optimizedUrl },
  } = await callFunction<{ optimizedUrl: string }>('downloadAndOptimizeImage', {
    imageUrl,
    bucketName,
    bucketPath,
  })

  return optimizedUrl
}

export const downloadImageByUrl = async (
  imageUrl: string,
  bucketName: string,
  bucketPath: string
): Promise<string> => {
  const {
    data: { url },
  } = await callFunction<{ url: string }>('downloadImage', {
    imageUrl,
    bucketName,
    bucketPath,
  })

  return url
}
