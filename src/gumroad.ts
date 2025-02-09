// shared with backend
export const getAuthorUsernameFromGumroadUrl = (url: string): string | null => {
  const parsedUrl = new URL(url)
  const hostname = parsedUrl.hostname

  const gumroadMatch = hostname.match(/^(.+)\.gumroad\.com$/)

  if (gumroadMatch) {
    return gumroadMatch[1]
  }

  return null
}

// shared with backend
export const getIsGumroadProductUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)

    if (!/\.gumroad\.com$/.test(parsedUrl.hostname)) {
      return false
    }

    return /^\/l\/[^/]+$/.test(parsedUrl.pathname)
  } catch {
    return false
  }
}
