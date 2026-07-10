import React from 'react'

import { DateRangeEditableField } from '@/editable-fields'
import DateTimeRangeInput from '@/components/datetime-range-input'
import EventDateRange from '@/components/event-date-range'
import { GenericInput } from '../../types'

const DateRangeInput: GenericInput<
  string,
  any,
  DateRangeEditableField<any>
> = ({ value, onChange, editableField, formFields, setFieldsValues }) => {
  if (!(editableField.endsAtFieldName in formFields)) {
    throw new Error(
      `Field "${
        editableField.endsAtFieldName
      }" does not exist in: ${Object.keys(formFields)}`
    )
  }

  const endsAtValue = formFields[editableField.endsAtFieldName]

  console.debug(`DateRangeInput.render`, {
    value,
    onChange,
    editableField,
    formFields,
    endsAtValue,
  })

  return (
    <div>
      <EventDateRange
        startsAt={new Date(value)}
        endsAt={new Date(endsAtValue)}
      />
      <br />
      <DateTimeRangeInput
        startsAtValue={value}
        endsAtValue={endsAtValue}
        onChange={(newStartsAtValue, newEndsAtValue) => {
          setFieldsValues({
            [editableField.name]: newStartsAtValue,
            [editableField.endsAtFieldName]: newEndsAtValue,
          })
        }}
      />
    </div>
  )
}

export default DateRangeInput
