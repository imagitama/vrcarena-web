import moment from 'moment'

export const getIsDateInFuture = (date: Date): boolean =>
  moment(date).isAfter(moment())

export const getIsDateInPast = (date: Date): boolean =>
  moment(date).isBefore(moment())

export const isDateOnSameDay = (date1: Date, date2: Date): boolean =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate()

export const isDateInbetweenTwoDates = (
  dateToCheck: Date,
  startDate: Date,
  endDate: Date
): boolean => dateToCheck >= startDate && dateToCheck <= endDate
