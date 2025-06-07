import { PopularCurrency } from '../currency'
import { FullAttachment } from './attachments'
import {
  AccessStatus,
  ApprovalStatus,
  MetaRecord,
  PublishStatus,
} from './common'
import { Tag } from './tags'

// TODO: Better func here as technically FullAsset has speciesnames
export const getIsPublicAsset = (asset: any): asset is PublicAsset =>
  asset && 'speciesnames' in asset

export const getIsFullAsset = (asset: any): asset is FullAsset =>
  asset && 'createdbyusername' in asset

export const getIsAssetWaitingForApproval = (asset: AssetMeta): boolean =>
  asset.publishstatus == PublishStatus.Published &&
  asset.approvalstatus == ApprovalStatus.Waiting &&
  asset.accessstatus == AccessStatus.Public

export const getIsAssetVisibleToEveryone = (asset: AssetMeta): boolean =>
  asset.accessstatus === AccessStatus.Public &&
  asset.approvalstatus === ApprovalStatus.Approved &&
  asset.publishstatus === PublishStatus.Published

export const getIsAssetDeclined = (asset: AssetMeta): boolean =>
  asset.accessstatus === AccessStatus.Public &&
  asset.approvalstatus === ApprovalStatus.Declined &&
  asset.publishstatus === PublishStatus.Draft

export const getIsAssetADraft = (asset: AssetMeta): boolean =>
  asset.publishstatus === PublishStatus.Draft

export const getIsAssetDeleted = (asset: AssetMeta): boolean =>
  asset.accessstatus == AccessStatus.Deleted

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
  requiresVerification?: boolean
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
  price: number | null
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
  vccurl?: string
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
  id: string
  name: string
  inviteurl?: string
  requirespatreon?: boolean
  patreonurl?: string
}

export interface VrchatWorld {}

export enum DeletionReason {
  author_request = 'author_request',
  dmca_claim = 'dmca_claim',
  inferior = 'inferior',
  violates_tos = 'violates_tos',
}

export enum ArchivedReason {
  product_missing = 'product_missing',
  product_discontinued = 'product_discontinued',
}

export enum DeclinedReason {
  violates_tos = 'violates_tos',
  inferior = 'inferior',
  missing_source = 'missing_source',
  invalid_source = 'invalid_source',
  missing_thumbnail = 'missing_thumbnail',
  invalid_thumbnail = 'invalid_thumbnail',
  missing_title = 'missing_title',
  invalid_title = 'invalid_title',
  missing_author = 'missing_author',
  incorrect_author = 'incorrect_author',
  missing_category = 'missing_category',
  incorrect_category = 'incorrect_category',
  missing_description = 'missing_description',
  too_short_description = 'too_short_description',
  missing_tags = 'missing_tags',
  not_many_tags = 'not_many_tags',
  missing_species = 'missing_species',
  incorrect_species = 'incorrect_species',
  missing_nsfw_flag = 'missing_nsfw_flag',
}

export interface AssetMeta extends MetaRecord {
  id: string
  publishedby: string
  featuredby: string
  lastmodifiedby: string
  lastmodifiedat: Date
  createdby: string
  createdat: Date
  approvedby: string
  publishedat: Date
  // not in MetaRecord
  deletionreason: DeletionReason
  archivedreason: ArchivedReason
  declinedreasons: DeclinedReason[]
  // specific to assets
  lastsyncedwithgumroadat: Date
}

export interface AssetStats {
  endorsementcount: number
  commentcount: number
  reviewcount: number
}

export interface PublicAsset extends CoreAssetFields {
  id: string
  authorname: string
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
  publishedbyusername: string
}

export interface SmallAsset extends Asset, AssetMeta {
  createdbyusername: string
  authorname: string
  speciesnames: string[]
  publishedbyusername: string
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
  syncedfields: string[] | null
  createdassetid: string
  lastmodifiedby: string
  lastmodifiedat: string
  createdby: string
  createdat: string
}

export interface FullAssetSyncQueueItem extends AssetSyncQueueItem {
  createdbyusername: string
  lastmodifiedbyusername: string
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
  GetFullMyAssetSyncQueuedItems = 'getfullassetsyncqueueditems',
  GetRandomPublicAvatars = 'getrandompublicavatars',
}

export enum FunctionNames {
  SearchAssets = 'searchassets',
}
