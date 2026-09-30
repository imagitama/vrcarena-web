import {
  DateTimePicker,
  DateTimePickerProps,
} from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'

const LazyDateTimePicker = (props: DateTimePickerProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DateTimePicker {...props} />
    </LocalizationProvider>
  )
}

export default LazyDateTimePicker
