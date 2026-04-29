import React, { useState } from 'react'

import TextInput from '@/components/text-input'

const UrlInput = ({
  value,
  onChange,
}: {
  value: string
  onChange: (newUrl: string) => void
}) => {
  const [userInput, setUserInput] = useState(value || '')

  return (
    <TextInput
      value={userInput}
      placeholder="Enter a URL"
      onChange={(e) => {
        setUserInput(e.target.value)
        onChange(e.target.value)
      }}
      fullWidth
      label="URL"
    />
  )
}

export default UrlInput
