import moment from 'moment'

export const getIsDateInFuture = (date: Date | string): boolean =>
  moment(date).isAfter(moment())

export const getIsDateInPast = (date: Date | string): boolean =>
  moment(date).isBefore(moment())

export const getIsDateOnSameDay = (date1: Date, date2: Date): boolean =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate()

export const getIsDateInbetweenTwoDates = (
  dateToCheck: Date,
  startDate: Date,
  endDate: Date
): boolean => dateToCheck >= startDate && dateToCheck <= endDate

export const getFriendlyDate = (
  date: Date | string | moment.Moment,
  isRelative: boolean = true,
  showTimezone: boolean = false,
  timezone?: string // falls back to system timezone
): string => {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isRelative) {
    return moment(date).fromNow()
  }

  if (moment.isMoment(date)) {
    return date.format(`dddd, MMMM D, YYYY h:mm A${showTimezone ? ' z' : ''}`)
  }

  const formatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
    ...(showTimezone ? { timeZoneName: 'short' } : {}), // sometimes shows user's localised timezone eg. PDT for americans
  }).format(d as Date)

  return addOrdinalSuffix(formatted)
}

const addOrdinalSuffix = (str: string): string =>
  str.replace(/\b(\d{1,2})\b(?=,)/, (_, day) => {
    const n = parseInt(day, 10)
    const suffix =
      n % 10 === 1 && n !== 11
        ? 'st'
        : n % 10 === 2 && n !== 12
        ? 'nd'
        : n % 10 === 3 && n !== 13
        ? 'rd'
        : 'th'
    return `${n}${suffix}`
  })

export const formatWithoutTime = 'D MMMM YYYY'

export const getFormattedDate = (date: Date | string, format: string): string =>
  moment(date).format(format)

export const getFriendlyDuration = (
  before: Date | string,
  after: Date | string
): string => {
  const diffMs = moment(after).diff(moment(before))
  const duration = moment.duration(Math.abs(diffMs))

  const hours = Math.floor(duration.asHours())
  const mins = duration.minutes()
  const secs = duration.seconds()

  const parts: string[] = []

  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`)
  if (mins > 0) parts.push(`${mins} ${mins === 1 ? 'min' : 'mins'}`)
  if (secs > 0 || parts.length === 0)
    parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`)

  return parts.join(' ')
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date)
  result.setUTCHours(result.getUTCHours() + hours)
  return result
}

export const getRelativeTime = (date: Date | string): string =>
  moment(date)
    .fromNow()
    .replace(/^in\s+/, '')
    .replace(/\s+ago$/, '')
