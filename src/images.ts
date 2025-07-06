import { callFunction } from './firebase'

enum FunctionName {
  DownloadAndOptimizeImage = 'downloadAndOptimizeImage',
}

export const optimizeImageByUrl = async (
  imageUrl: string,
  bucketName: string,
  bucketPath?: string
): Promise<string> => {
  const {
    data: { optimizedUrl },
  } = await callFunction<
    { imageUrl: string; bucketName: string; bucketPath?: string },
    { optimizedUrl: string }
  >(FunctionName.DownloadAndOptimizeImage, {
    imageUrl,
    bucketName,
    bucketPath: bucketPath || '', // errors if this is not a string
  })

  return optimizedUrl
}
