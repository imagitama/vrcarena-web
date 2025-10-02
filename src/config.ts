import otherSpeciesThumbnailUrl from './assets/images/other-species.webp'
import { SpeciesFields } from './modules/species'

export const BUSINESS_NAME = 'VRCArena' // privacy policy, TOS, DMCA, etc.
export const WEBSITE_FULL_URL = 'https://www.vrcarena.com'
export const TWITTER_URL = 'https://twitter.com/VRCArena'
export const DISCORD_URL = 'https://discord.gg/UVs9V58'
export const PATREON_BECOME_PATRON_URL =
  'https://www.patreon.com/bePatron?u=43812267'
export const EMAIL = 'contact@vrcarena.com'
export const FURALITY_URL = `https://furality.org/?referrer=${encodeURIComponent(
  WEBSITE_FULL_URL
)}`

export const BANNER_WIDTH = 1280
export const BANNER_HEIGHT = 300

export const THUMBNAIL_WIDTH = 300
export const THUMBNAIL_HEIGHT = 300

export const PROMO_WIDTH = 512
export const PROMO_HEIGHT = 512

export const AVATAR_WIDTH = THUMBNAIL_WIDTH
export const AVATAR_HEIGHT = THUMBNAIL_HEIGHT

export const ASSET_TITLE_MIN_LENGTH = 5
export const ASSET_TITLE_MAX_LENGTH = 60

export const NONATTACHMENT_MAX_SIZE_BYTES = 4194304

export const otherSpeciesKey = 'other-species'

// @ts-ignore
export const otherSpeciesMeta: SpeciesFields = {
  pluralname: 'Other Species',
  singularname: 'Other Species',
  description: 'Assets that do not have a species.',
  shortdescription: 'Assets that do not have a species.',
  thumbnailsourceurl: otherSpeciesThumbnailUrl,
}

export const alreadyOver18Key = 'already-over-18'
export const activeSearchFilterNamesKey = 'search-filters'

export const formHideDelay = 2000

export const searchFilterNames = {
  tags: 'tags',
}

export const searchFilters = [
  {
    name: searchFilterNames.tags,
    label: 'Tags',
  },
]

export const ContentTypes = {
  IMAGE: 'IMAGE',
  YOUTUBE_VIDEO: 'YOUTUBE_VIDEO',
  TWEET: 'TWEET',
}

export const importantTags = {
  neosvr_compatible: 'neosvr_compatible',
  chilloutvr_compatible: 'chilloutvr_compatible',
  free: 'free',
}

export const nsfwRules = `"Adult" means NSFW (Not Safe For Work). In general it means anything that your boss wouldn't want you to look at while at work. This includes:

- sexual acts
- sex toys
- nudity (male/female genitals, female breasts with nipples, including toony x-anuses)
- clearly outlined genitals in clothing (underwear, bras, etc.)
- "extreme" fetishes (eg. heavy BDSM like whips, muzzles, chastity - harnesses are OK)
- suggestive poses (where focus is on the genital area or butt or some sexual act)
- gore (some realistic blood is OK)

**You must toggle adult "on" for any asset that has the above.**`

export const adultSearchTerms = [
  // general
  'nsfw',
  'fetish',
  // sexual acts
  'sex',
  'cum',
  // sex toys
  'sex toy',
  // nudity
  'penis',
  'dick',
  'cock',
  'vagina',
  'pussy',
  'anus',
  'anal',
  'genital',
  'genitals',
  'sheath',
  // extreme fetishes
  'muzzle',
  'whip',
  'chastity',
  'cock cage',
  'vore',
  // gore
  'blood',
]

export const colorPalette = {
  positive: 'rgb(200, 255, 200)',
  negative: 'rgb(255, 200, 200)',
  warning: 'rgb(255, 255, 200)',
  // TODO: move to a themes thing
  selectedBg: 'rgb(50, 50, 0)',
  selectedBoxShadow: '0 0 0 2px rgb(100, 100, 0)',
}

export const vrcFuryOrange = '#e90'
export const discordPurple = '#5865F2'

export const viewVrchatAvatarUrlWithVar =
  'https://vrchat.com/home/avatar/:avatarId'

export const messages = {
  howClaimsWork:
    'Claiming something does not mean you "own" it. It just indicates to other people that you claim that it is yours.',
}
