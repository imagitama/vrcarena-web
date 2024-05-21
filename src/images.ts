import { callFunction } from './firebase'

export const optimizeImageByUrl = async (
  imageUrl: string,
  bucketName: string,
  bucketPath?: string
): Promise<string> => {
  const {
    data: { optimizedUrl },
  } = await callFunction<{ optimizedUrl: string }>('downloadAndOptimizeImage', {
    imageUrl,
    bucketName,
    bucketPath: bucketPath || '', // errors if this is not a string
  })

  return optimizedUrl
}
