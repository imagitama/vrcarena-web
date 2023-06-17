import furalitySylvaLogoUrl from './assets/images/events/furality-sylva.webp'
import hexFurryFestivalUrl from './assets/images/events/hex-furry-festival.webp'
import prideUrl from './assets/images/events/pride.webp'

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
    description: `The world's largest virtual reality furry convention. Happening entirely in VRChat, this weekend-long event is dedicated to celebrating and uniting the vibrant and creative VR furry community from all corners of the globe.`,
    thumbnailUrl: furalitySylvaLogoUrl,
    sourceUrl: 'https://go.furality.org/vrcarena',
    assetTags: ['furality', 'furality_sylva']
  },
  'hex-furry-festival': {
    title: 'Hex Furry Festival',
    description:
      'Hex Furry Festival is an online EDM festival ran through Twitch, VRChat, and Discord. Free to all!',
    thumbnailUrl: hexFurryFestivalUrl,
    sourceUrl: 'https://hexfurryfest.com/?source=vrcarena',
    assetTags: ['hex_furry_festival']
  },
  'pride-month': {
    title: 'Pride Month',
    description:
      'LGBT Pride Month is a month, typically June, dedicated to celebration and commemoration of lesbian, gay, bisexual, and transgender pride.',
    thumbnailUrl: prideUrl,
    sourceUrl: 'https://en.wikipedia.org/wiki/Pride_Month',
    assetTags: ['pride', 'lgbt']
  }
}

export const getEventNameFromReason = (reason: string): string =>
  reason.replaceAll('_', '-')

export const getTitleForReason = (reason: string) => {
  const fixedReason = getEventNameFromReason(reason)
  return fixedReason in events ? events[fixedReason].title : 'Event'
}

export default events
