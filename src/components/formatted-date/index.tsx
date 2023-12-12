import React from 'react'
import moment from 'moment'
import { getFriendlyDate } from '../../utils/dates'

export default ({
  date,
  isRelative = true,
}: {
  date: Date | string
  isRelative?: boolean
}) =>
  date ? (
    <span title={moment(date).toString()}>
      {getFriendlyDate(date, isRelative)}
    </span>
  ) : (
    <span>(no date)</span>
  )
