// shared with backend
export const getIsKofiProductUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'ko-fi.com' && /^\/s\/\w+$/.test(parsed.pathname)
  } catch {
    return false
  }
}

export function getAuthorUrlForKofiUsername(username: string): string {
  return `https://ko-fi.com/${username}/shop`
}
