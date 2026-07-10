import moment from 'moment-timezone'

interface TimezoneInfo {
  timezone: string
  offset: string
}

export const getTimezoneInfo = (): TimezoneInfo => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const offsetMinutes = -new Date().getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absMinutes = Math.abs(offsetMinutes)
  const hours = String(Math.floor(absMinutes / 60)).padStart(2, '0')
  const minutes = String(absMinutes % 60).padStart(2, '0')
  const offset = `GMT${sign}${hours}:${minutes}`

  return { timezone, offset }
}

interface AnchorTimezone {
  label: string
  abbr: string
  zone: string
}

export const anchorTimezones: AnchorTimezone[] = [
  { label: 'Pacific Time', abbr: 'PT', zone: 'America/Los_Angeles' },
  { label: 'Eastern Time', abbr: 'ET', zone: 'America/New_York' },
  { label: 'UTC / London', abbr: 'GMT', zone: 'Europe/London' },
  { label: 'Central Europe', abbr: 'CET', zone: 'Europe/Berlin' },
  { label: 'India', abbr: 'IST', zone: 'Asia/Kolkata' },
  { label: 'Japan / Korea', abbr: 'JST', zone: 'Asia/Tokyo' },
]

export const getDateInAllZones = (
  date: Date,
  format = 'ddd, MMM D, h:mm A z'
) =>
  anchorTimezones.map((tz) => {
    const m = moment(date).tz(tz.zone)
    return {
      label: tz.label,
      abbr: tz.abbr,
      zone: tz.zone,
      date: m,
      offset: m.format('Z'),
    }
  })
