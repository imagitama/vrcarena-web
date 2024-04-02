import React, { useState } from 'react'
import {
  addQuotesToDescription,
  removeQuotesFromDescription,
} from '../../../../utils/formatting'
import CheckboxInput from '../../../checkbox-input'
import MarkdownEditor from '../../../markdown-editor'
import FormControls from '../../../form-controls'

const MarkdownInput = ({
  value,
  onChange,
  isDisabled,
}: {
  value: string
  onChange: (newText: string) => void
  isDisabled: boolean
}) => {
  const [isUsingQuotes, setIsUsingQuotes] = useState(true)

  const toggleQuotes = () => {
    const newVal = !isUsingQuotes
    const isNowUsing = newVal === true

    setIsUsingQuotes(newVal)

    const newText = isNowUsing
      ? addQuotesToDescription(value)
      : removeQuotesFromDescription(value)

    onChange(newText)
  }

  return (
    <>
      <FormControls>
        <CheckboxInput
          value={isUsingQuotes}
          onChange={() => toggleQuotes()}
          label="Use quote symbols (recommended)"
        />
      </FormControls>
      <MarkdownEditor
        content={value}
        onChange={(newText) => onChange(newText)}
        isDisabled={isDisabled}
      />
    </>
  )
}

export default MarkdownInput
