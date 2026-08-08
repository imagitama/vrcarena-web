import React, { useState } from 'react'

import TextInput, { Props as TextInputProps } from '@/components/text-input'

const UrlInput = ({
  value,
  defaultValue,
  onChange,
  ...textInputProps
}: {
  value?: string
  defaultValue?: string
  onChange: (newUrl: string) => void
} & Omit<TextInputProps, 'value' | 'onChange'>) => {
  const [userInput, setUserInput] = useState(value || defaultValue || '')

  return (
    <TextInput
      value={value !== undefined ? value : userInput}
      placeholder="Enter a URL"
      onChange={(e) => {
        setUserInput(e.target.value)
        onChange(e.target.value)
      }}
      fullWidth
      label="URL"
      {...textInputProps}
    />
  )
}

export default UrlInput
