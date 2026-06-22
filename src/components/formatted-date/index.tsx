import React from 'react'
import moment from 'moment'
import { getFriendlyDate } from '@/utils/dates'

const FormattedDate = ({
  date,
  isRelative = true,
  className,
  showTimezone = false,
}: {
  date: Date | string
  isRelative?: boolean
  className?: string
  showTimezone?: boolean
}) =>
  date ? (
    <span className={className} title={moment(date).toString()}>
      {getFriendlyDate(date, isRelative, showTimezone)}
    </span>
  ) : (
    <span className={className}>(no date)</span>
  )

export default FormattedDate
