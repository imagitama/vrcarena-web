import TextInput from '@/components/text-input'
import { GenericInputProps } from '../../types'
import StatusText from '@/components/status-text'
import { useEffect, useState } from 'react'

// requires a digit so "1", "1.0", "-0.5" but "", ".5" is bad
const FLOAT_REGEX = /^-?\d+(\.\d+)?$/

const FloatInput = ({ value, onChange }: GenericInputProps<any, any>) => {
  const [textVal, setTextVal] = useState(
    value !== undefined ? value.toString() : ''
  )

  // TODO: sync with incoming value

  useEffect(() => {
    if (FLOAT_REGEX.test(textVal)) {
      const floatVal = parseFloat(textVal)
      onChange(floatVal)
    }
  }, [textVal])

  return (
    <>
      <TextInput
        type="text"
        value={textVal}
        onChange={(e) => setTextVal(e.target.value)}
      />
      {FLOAT_REGEX.test(textVal) ? null : (
        <StatusText positivity={-1}>
          The value "{textVal}" looks invalid
        </StatusText>
      )}
    </>
  )
}

export default FloatInput
