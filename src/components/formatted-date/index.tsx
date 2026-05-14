import React from 'react'
import moment from 'moment'
import { getFriendlyDate } from '@/utils/dates'

export default ({
  date,
  isRelative = true,
  className,
}: {
  date: Date | string
  isRelative?: boolean
  className?: string
}) =>
  date ? (
    <span className={className} title={moment(date).toString()}>
      {getFriendlyDate(date, isRelative)}
    </span>
  ) : (
    <span className={className}>(no date)</span>
  )
