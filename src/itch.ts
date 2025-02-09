// shared with backend
export const getAuthorUsernameFromItchUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname

    const itchMatch = hostname.match(/^(.+)\.itch\.io$/)

    if (itchMatch) {
      return itchMatch[1]
    }
  } catch {
    return null
  }

  return null
}

// shared with backend
export const getIsItchProductUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)

    if (!/\.itch\.io$/.test(parsedUrl.hostname)) {
      return false
    }

    return /^\/[^/]+$/.test(parsedUrl.pathname)
  } catch {
    return false
  }
}

export function getAuthorUrlForItchUsername(username: string): string {
  return `https://${username}.itch.io`
}
