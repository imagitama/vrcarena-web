import { BasicEvent } from '@/modules/events'

export const getIsEventLive = (event: BasicEvent): boolean => {
  const now = new Date()
  const start = new Date(event.startsat)
  const end = new Date(event.endsat)
  return now >= start && now <= end
}

export const getIsEventUpcoming = (event: BasicEvent): boolean => {
  const now = new Date()
  const start = new Date(event.startsat)
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return start > now && start <= oneWeekFromNow
}
