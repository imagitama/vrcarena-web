export const getImageUrlAsFile = async (
  url: string,
  filenameWithoutExt: string = 'my-file',
  ext?: string
): Promise<File> => {
  const resp = await fetch(url)
  const blob = await resp.blob()
  const extToUse = ext
    ? ext
    : // @ts-ignore
      url
        .split('?')[0]
        .split('/')
        .pop()
        .split('.')
        .pop()
  const filename = `${filenameWithoutExt}.${extToUse}`
  const file = new File([blob], filename, blob)
  return file
}
