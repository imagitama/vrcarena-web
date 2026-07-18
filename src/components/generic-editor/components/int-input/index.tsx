import TextInput from '@/components/text-input'
import { GenericInputProps } from '../../types'
import StatusText from '@/components/status-text'
import { useEffect, useState } from 'react'

// requires an int so "0", "1", "-123"
const INT_REGEX = /^-?\d+$/

const IntInput = ({ value, onChange }: GenericInputProps<any, any>) => {
  const [textVal, setTextVal] = useState(
    value !== undefined ? value.toString() : ''
  )

  // TODO: sync with incoming value

  useEffect(() => {
    if (INT_REGEX.test(textVal)) {
      const intVal = parseInt(textVal)
      onChange(intVal)
    }
  }, [textVal])

  return (
    <>
      <TextInput
        type="text"
        value={textVal}
        onChange={(e) => setTextVal(e.target.value)}
      />
      {INT_REGEX.test(textVal) ? null : (
        <StatusText positivity={-1}>
          The value "{textVal}" looks invalid
        </StatusText>
      )}
    </>
  )
}

export default IntInput
