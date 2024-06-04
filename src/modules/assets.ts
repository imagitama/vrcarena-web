import { PopularCurrency, popularCurrencies } from '../currency'
import {
  AccessStatuses,
  ApprovalStatuses,
  PinnedStatuses,
  PublishStatuses,
} from '../hooks/useDatabaseQuery'
import { FullAttachment } from './attachments'
import { FeaturedStatus as FeaturedStatuses } from './common'
import { Tag } from './tags'

export enum RelationType {
  Parent = 'parent',
  // Child = 'child',
  // Sibling = 'sibling'
  Suggested = 'suggested',
  Similar = 'similar',
  Other = 'other',
}

export enum AssetCategory {
  Avatar = 'avatar',
  Accessory = 'accessory',
  Animation = 'animation',
  Tutorial = 'tutorial',
  Shader = 'shader',
  Retexture = 'retexture',
  WorldAsset = 'worldAsset',
  Tool = 'tool',
}

export interface Relation {
  asset: string
  type: string
  comments: string
}

export interface SourceInfo {
  url: string
  price: number | null
  pricecurrency: PopularCurrency | null
  comments: string
}

export interface AssetFields {
  title: string
  description: string
  shortdescription: string
  thumbnailurl: string
  pedestalvideourl: string
  pedestalfallbackimageurl: string
  author: string // id
  category: AssetCategory
  tags: string[]
  bannerurl: string
  slug: string
  species: string[]
  vrchatclonableavatarids: string[]
  vrchatclonableworldids: string[]
  price: number
  pricecurrency: PopularCurrency
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
  extradata: ExtraData
  attachmentids: string[]
  extrasources: SourceInfo[]
}

export interface Asset extends AssetFields {
  id: string
  createdat: Date
}

export interface ExtraData {
  vrcfury: VrcFurySettings
}

export interface VrcFurySettings {
  prefabs: VrcFuryPrefabInfo[]
}

export interface VrcFuryPrefabInfo {
  url: string
  discordServerId?: string
  // when full:
  discordserverdata?: DiscordServerData | null
}

export interface TutorialStep {}

export interface DiscordServerData {
  name: string
  inviteurl?: string
  requirespatreon?: boolean
  patreonurl?: string
}

export interface VrchatWorld {}

export interface AssetMeta {
  editornotes: string
  publishstatus: PublishStatuses
  publishedby: string // user ref
  accessstatus: AccessStatuses
  approvalstatus: ApprovalStatuses
  pinnedstatus: PinnedStatuses
  featuredstatus: FeaturedStatuses
  featuredby: string // user ref
  lastmodifiedby: string // user ref
  lastmodifiedat: Date
  createdby: string // user ref
  createdat: Date
  lastsyncedwithgumroadat: Date
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
  discordserverdata: DiscordServerData | null
  clonableworlddata: VrchatWorld | null
  relationsdata: Asset[]
  approvedbyusername: string
  tagsdata: Tag[]
  attachmentsdata: FullAttachment[] | null
}

export enum CollectionNames {
  Assets = 'assets',
  AssetsMeta = 'assetmeta',
  TagStats = 'tagstats',
}

export enum ViewNames {
  GetFullAssets = 'getfullassets',
  GetPublicAssets = 'getpublicassets',
}

// legacy

export const AssetFieldNames = {
  title: 'title',
  isAdult: 'isadult',
  tags: 'tags',
  createdBy: 'createdby',
  createdAt: 'createdat',
  category: 'category',
  species: 'species',
  sourceUrl: 'sourceurl',
  videoUrl: 'videourl',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat',
  thumbnailUrl: 'thumbnailurl',
  description: 'description',
  author: 'author',
  children: 'children',
  discordServer: 'discordserver',
  bannerUrl: 'bannerurl',
  tutorialSteps: 'tutorialsteps',
  pedestalVideoUrl: 'pedestalvideourl',
  pedestalFallbackImageUrl: 'pedestalfallbackimageurl',
  sketchfabEmbedUrl: 'sketchfabembedurl',
  slug: 'slug',
  clonableWorld: 'clonableworld',
  vrchatClonableWorldIds: 'vrchatclonableworldids',
  vrchatClonableAvatarIds: 'vrchatclonableavatarids',
  shortDescription: 'shortdescription',
  price: 'price',
  priceCurrency: 'pricecurrency',
  gumroad: 'gumroad',
  ranks: 'ranks',
  relations: 'relations',
}
