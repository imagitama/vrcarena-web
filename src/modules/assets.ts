import { PopularCurrency } from '../currency'
import {
  AccessStatuses,
  ApprovalStatuses,
  PinnedStatuses,
  PublishStatuses,
} from '../hooks/useDatabaseQuery'
import { FullAttachment } from './attachments'
import { FeaturedStatus as FeaturedStatuses } from './common'
import { Tag } from './tags'

// TODO: Better func here as technically FullAsset has speciesnames
export const getIsPublicAsset = (asset: any): asset is PublicAsset =>
  asset && 'speciesnames' in asset

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

// minimal data shared between ALL views
export interface CoreAssetFields extends Record<string, unknown> {
  title: string
  thumbnailurl: string
  author: string // id
  category: AssetCategory
  slug: string
  isadult: boolean
  price: number
  pricecurrency: PopularCurrency
  species: string[]
  tags: string[] // used for "free" check and to group into areas
}

export interface AssetFields extends CoreAssetFields, Record<string, unknown> {
  sourceurl: string
  description: string
  shortdescription: string
  pedestalvideourl: string
  pedestalfallbackimageurl: string
  bannerurl: string
  vrchatclonableavatarids: string[]
  vrchatclonableworldids: string[]
  gumroad?: {
    sync: boolean
    fields: { [fieldName: string]: boolean }
  }
  discordserver: string | null // id
  relations: Relation[]
  tutorialsteps: TutorialStep[]
  ranks: string[]
  extradata: ExtraData
  attachmentids: string[]
  extrasources: SourceInfo[]
}

export interface Asset extends AssetFields, Record<string, unknown> {
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
  discordServerId?: string | null
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

export interface PublicAsset extends CoreAssetFields {
  id: string
  authorname: string
  isfree: boolean
  speciesnames: string[]
  // meta
  createdat: string
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

export enum AssetSyncStatus {
  Waiting = 'waiting',
  Processing = 'processing',
  Failed = 'failed',
  Success = 'success',
}

export interface AssetSyncQueueItemFields extends Record<string, unknown> {
  sourceurl: string
}

export interface AssetSyncQueueItem extends AssetSyncQueueItemFields {
  id: string
  status: AssetSyncStatus
  failedreason: string
  createdassetid: string
  lastmodifiedby: string
  lastmodifiedat: string
  createdby: string
  createdat: string
}

export enum CollectionNames {
  Assets = 'assets',
  AssetsMeta = 'assetmeta',
  TagStats = 'tagstats',
  AssetSyncQueue = 'assetsyncqueue',
}

export enum ViewNames {
  GetFullAssets = 'getfullassets',
  GetPublicAssets = 'getpublicassets',
  RelatedAssets = 'relatedassets',
  GetNewPublicAssets = 'getnewpublicassets',
  GetMyAssetSyncQueuedItems = 'getmyassetsyncqueueditems',
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
