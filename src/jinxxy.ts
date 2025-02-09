// shared with backend
export const getAuthorUsernameFromJinxxyUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url)

    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean)

    if (pathSegments.length >= 2) {
      return pathSegments[0] // First segment is the author's username
    }
  } catch {
    return null
  }

  return null
}

// shared with backend
export const getIsJinxxyProductUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)

    if (!/^jinxxy\.com$/.test(parsedUrl.hostname)) {
      return false
    }

    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean)

    return pathSegments.length === 2 // Expect exactly 2 segments: username and product name
  } catch {
    return false
  }
}

export function getAuthorUrlForJinxxyUsername(username: string): string {
  return `https://jinxxy.com/${username}/products`
}
