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

export const getFriendlyDate = (
  date: Date | string,
  isRelative: boolean = true
): string =>
  isRelative
    ? moment(date).fromNow()
    : moment(date).format('dddd, MMMM Do YYYY, h:mm:ss a')

export const getFormattedDate = (date: Date | string, format: string): string =>
  moment(date).format(format)

export const getFriendlyDuration = (before: Date | string, after: Date | string): string => {
  const diffMs = moment(after).diff(moment(before))
  const duration = moment.duration(Math.abs(diffMs))

  const hours = Math.floor(duration.asHours())
  const mins = duration.minutes()
  const secs = duration.seconds()

  const parts: string[] = []

  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`)
  if (mins > 0) parts.push(`${mins} ${mins === 1 ? 'min' : 'mins'}`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`)

  return parts.join(' ')
}