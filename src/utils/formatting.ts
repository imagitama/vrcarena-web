import { shortIdLength } from '@/config'

export const addQuotesToDescription = (desc: string): string => {
  return desc
    ? desc
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
    : ''
}

export const removeQuotesFromDescription = (desc: string): string => {
  return desc
    ? desc
        .split('\n')
        .map((line) => {
          if (line.substring(0, 2) === '> ') return line.substr(2, line.length)
          return line
        })
        .join('\n')
    : ''
}

export function trimDescription(desc: string, maxLength: number = 200): string {
  if (desc.length >= maxLength) {
    return `${desc.substring(0, maxLength)}...`
  }
  return desc
}

export const getUserFriendlyNumber = (num: number): string => {
  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''

  if (absNum < 1000) {
    return `${sign}${absNum}`
  }

  const units = [
    { value: 1_000_000_000, suffix: 'B' },
    { value: 1_000_000, suffix: 'M' },
    { value: 1_000, suffix: 'k' },
  ]

  for (const { value, suffix } of units) {
    if (absNum >= value) {
      const formatted = (absNum / value).toFixed(1).replace(/\.0$/, '')
      return `${sign}${formatted}${suffix}`
    }
  }

  return `${sign}${absNum}`
}

export const getShortId = (uuid: string): string =>
  uuid.substring(0, shortIdLength)
