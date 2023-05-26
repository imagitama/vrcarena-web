export const addQuotesToDescription = desc => {
  return desc
    ? desc
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n')
    : ''
}

export const removeQuotesFromDescription = desc => {
  return desc
    ? desc
        .split('\n')
        .map(line => {
          if (line.substr(0, 2) === '> ') return line.substr(2, line.length)
          return line
        })
        .join('\n')
    : ''
}

export function trimDescription(description, maxLength = 200) {
  if (description.length >= maxLength) {
    return `${description.substr(0, maxLength)}...`
  }
  return description
}
