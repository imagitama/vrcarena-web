import CheckboxInput from '../checkbox-input'
import useIsDateFormatUS from '@/hooks/useIsDateFormatUS'

const DateFormatToggle = () => {
  const [isDateFormatUS, setIsDateFormatUS] = useIsDateFormatUS()

  return (
    <CheckboxInput
      value={isDateFormatUS !== false}
      onChange={(newVal) => setIsDateFormatUS(newVal)}
      label="U.S. date format"
    />
  )
}

export default DateFormatToggle
