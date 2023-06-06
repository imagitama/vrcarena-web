import furalitySylvaLogoUrl from './assets/images/furality-sylva-logo-md.png'

interface EventInfo {
  title: string
  description: string
  thumbnailUrl: string
  sourceUrl: string
  assetTags: string[]
}

const events: { [eventName: string]: EventInfo } = {
  'furality-sylva': {
    title: 'Furality Sylva',
    description: 'It is a cool event',
    thumbnailUrl: furalitySylvaLogoUrl,
    sourceUrl: 'https://go.furality.org/vrcarena',
    assetTags: ['furality', 'furality_sylva']
  }
}

export const getEventNameFromReason = (reason: string): string =>
  reason.replaceAll('_', '-')

export const getTitleForReason = (reason: string) => {
  const fixedReason = getEventNameFromReason(reason)
  return fixedReason in events ? events[fixedReason].title : 'Event'
}

export default events
