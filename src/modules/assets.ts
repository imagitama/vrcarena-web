import { popularCurrencies } from '../currency'
import {
  AccessStatuses,
  ApprovalStatuses,
  FeaturedStatuses,
  PinnedStatuses,
  PublishStatuses
} from '../hooks/useDatabaseQuery'

export const RelationType = {
  Parent: 'parent',
  // Child: 'child',
  // Sibling: 'sibling'
  Suggested: 'suggested',
  Similar: 'similar',
  Other: 'other'
}

export interface Relation {
  asset: string
  type: string
  comments: string
}

export interface Asset {
  id: string
  title: string
  description: string
  shortdescription: string
  thumbnailurl: string
  pedestalvideourl: string
  pedestalfallbackimageurl: string
  author: string // id
  category: string
  tags: string[]
  bannerurl: string
  fileurls: string[]
  slug: string
  species: string[]
  vrchatclonableavatarids: string[]
  vrchatclonableworldids: string[]
  price: number
  pricecurrency: keyof typeof popularCurrencies
  sourceurl: string
  gumroad?: {
    sync: boolean
    fields: { [fieldName: string]: boolean }
  }
  discordserver: string // id
  isadult: boolean
  relations: Relation[]
  tutorialsteps: TutorialStep[]
  ranks: string[]
  createdat: Date
}

interface TutorialStep {}

interface DiscordServer {}

interface VrchatWorld {}

export interface AssetMeta {
  editornotes: string
  publishstatus: keyof typeof PublishStatuses
  publishedby: string // user ref
  accessstatus: keyof typeof AccessStatuses
  approvalstatus: keyof typeof ApprovalStatuses
  pinnedstatus: keyof typeof PinnedStatuses
  featuredstatus: keyof typeof FeaturedStatuses
  featuredby: string // user ref
  lastmodifiedby: string // user ref
  lastmodifiedat: Date
  createdby: string // user ref
  createdat: Date
  lastsyncedwithgumroadat: Date
  tweetrecordids: string[]
  approvedat: Date
  approvedby: string
  publishedat: Date
}

export interface AssetStats {
  endorsementcount: number
  commentcount: number
  reviewcount: number
}

export interface PublicAsset extends Asset, AssetMeta, AssetStats {
  author: string
  authorname: string
}

export interface FullAsset extends Asset, AssetMeta, AssetStats {
  // authors
  authorname: string
  isopenforcommission: boolean
  commissioninfo: string
  showcommissionstatusforassets: boolean
  salereason: string | null
  saledescription: string | null
  saleexpiresat: Date | null

  speciesnames: string[]
  createdbyusername: string
  lastmodifiedbyusername: string
  linkedassets: Asset[]
  incominglinkedassets: Asset[]
  discordserverdata: DiscordServer | null
  clonableworlddata: VrchatWorld | null
  relationsdata: Asset[]

  // approval
  approvedbyusername: string
}

export const CollectionNames = {
  Assets: 'assets',
  AssetsMeta: 'assetmeta'
}
