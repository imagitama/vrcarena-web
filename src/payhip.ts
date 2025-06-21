// shared with backend
export const getIsPayHipProductUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return (
      (parsed.hostname === 'payhip.com' ||
        parsed.hostname.endsWith('.payhip.com')) &&
      /^\/b\/[a-zA-Z0-9]+$/.test(parsed.pathname)
    )
  } catch {
    return false
  }
}

export function getAuthorUrlForPayHipUsername(username: string): string {
  return `https://payhip.com/${username}`
}
