// shared with backend
export const getAuthorUsernameFromBoothUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname

    const boothMatch = hostname.match(/^(.+)\.booth\.pm$/)

    if (boothMatch) {
      return boothMatch[1]
    }

    return null
  } catch {
    return null
  }
}

// shared with backend
export const getIsBoothProductUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)

    if (
      /\.booth\.pm$/.test(parsedUrl.hostname) ||
      parsedUrl.hostname === 'booth.pm'
    ) {
      return /^\/([a-zA-Z]{2}\/)?items\/\d+$/.test(parsedUrl.pathname)
    }

    return false
  } catch {
    return false
  }
}
