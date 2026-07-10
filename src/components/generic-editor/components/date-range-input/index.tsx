import React from 'react'

import { DateRangeEditableField } from '@/editable-fields'
import DateTimeRangeInput from '@/components/datetime-range-input'
import EventDateRange from '@/components/event-date-range'
import { GenericInput } from '../../types'

const DateRangeInput: GenericInput<
  string,
  any,
  DateRangeEditableField<any>
> = ({ editableField, formFields, setFieldsValues }) => {
  if (!(editableField.endsAtFieldName in formFields)) {
    throw new Error(
      `Field "${
        editableField.endsAtFieldName
      }" does not exist in: ${Object.keys(formFields)}`
    )
  }

  const startsAtValue = formFields[editableField.startsAtFieldName]
  const endsAtValue = formFields[editableField.endsAtFieldName]

  return (
    <div>
      {startsAtValue && endsAtValue && (
        <EventDateRange
          startsAt={new Date(startsAtValue)}
          endsAt={new Date(endsAtValue)}
        />
      )}
      <br />
      <DateTimeRangeInput
        startsAtValue={startsAtValue}
        endsAtValue={endsAtValue}
        onChange={(newStartsAtValue, newEndsAtValue) => {
          setFieldsValues({
            [editableField.startsAtFieldName]: newStartsAtValue,
            [editableField.endsAtFieldName]: newEndsAtValue,
          })
        }}
      />
    </div>
  )
}

export default DateRangeInput
