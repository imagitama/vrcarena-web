export function getIsEmailAddress(value: unknown): value is string {
  if (typeof value !== 'string') return false

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emailRegex.test(value)
}
