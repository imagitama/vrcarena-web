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
    const { hostname, pathname } = new URL(url)

    const isFullStore =
      /\.gumroad\.com$/.test(hostname) && /^\/l\/[^/]+$/.test(pathname)
    const isLegacy = hostname === 'gumroad.com' && /^\/l\/[^/]+$/.test(pathname)
    const isShort = hostname === 'gum.co' && /^\/[^/]+$/.test(pathname)
    const isApp =
      hostname === 'app.gumroad.com' && /^\/products\/[^/]+$/.test(pathname)

    return isFullStore || isLegacy || isShort || isApp
  } catch {
    return false
  }
}
