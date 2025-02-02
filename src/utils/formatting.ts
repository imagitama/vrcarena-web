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
