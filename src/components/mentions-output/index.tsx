import React from 'react'
import UsernameLink from '../username-link'

const Line = ({ line, mentions }: { line: string; mentions: string[] }) => {
  const regex = /\[user:(\w+)\]/g
  let mentionIdx = 0

  // Split the input string based on the regex
  const parts = line.split(regex)

  // Map each part to a React element
  const elements = parts.map((part, index) => {
    if (index % 2 === 1) {
      // If it's an odd index, it's a user ID, so render a React element
      const userId = part
      const username = mentions[mentionIdx]
      mentionIdx++
      return (
        <UsernameLink key={index} id={userId}>
          @{username}
        </UsernameLink>
      )
    } else {
      // If it's an even index, it's just plain text
      return part
    }
  })

  return <>{elements}</>
}

const MentionsOutput = ({
  text,
  mentions,
}: {
  text: string
  mentions: string[]
}) => {
  let elements: React.ReactElement[] = []

  const lines = text.split('\n')

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    if (lineIdx > 0) {
      elements.push(<br />)
    }

    const line = lines[lineIdx]

    elements.push(<Line key={lineIdx} line={line} mentions={mentions} />)
  }

  return <>{elements}</>
}

export default MentionsOutput
