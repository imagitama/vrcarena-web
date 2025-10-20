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
  (asset.approvalstatus == ApprovalStatus.Waiting ||
    asset.approvalstatus == ApprovalStatus.AutoApproved) &&
  asset.accessstatus == AccessStatus.Public

export const getIsAssetVisibleToEveryone = (asset: AssetMeta): boolean =>
  asset.accessstatus === AccessStatus.Public &&
  (asset.approvalstatus === ApprovalStatus.Approved ||
    asset.approvalstatus === ApprovalStatus.AutoApproved) &&
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
  author: string | null // id
  category: AssetCategory
  slug: string
  isadult: boolean
  price: number | null
  pricecurrency: PopularCurrency | null
  species: string[]
  tags: string[] // used for "free" check and to group into areas
}

interface DeprecatedAssetFields {
  shortdescription: string
  pedestalvideourl: string
  pedestalfallbackimageurl: string
  gumroad?: {
    sync: boolean
    fields: { [fieldName: string]: boolean }
  }
  vrchatclonableworldids: string[]
  ranks: string[]
  tutorialsteps: TutorialStep[]
}

export interface AssetFields
  extends DeprecatedAssetFields,
    CoreAssetFields,
    Record<string, unknown> {
  sourceurl: string
  description: string
  bannerurl: string // disabled sep 2025 for bandwidth
  vrchatclonableavatarids: string[]
  discordserver: string | null // id
  relations: Relation[]
  extradata: ExtraData
  attachmentids: string[]
  extrasources: SourceInfo[]
  vccurl?: string
  sketchfabembedurl: string
}

export interface Asset extends AssetFields, Record<string, unknown> {
  id: string
  createdat: string
  createdby: string
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

export enum IndicativeAuditStatus {
  Available = 'available',
  Unavailable = 'unavailable',
  Missing = 'missing',
}

export interface AssetMeta extends MetaRecord {
  id: string
  publishedby: string | null
  featuredby: string | null
  lastmodifiedby: string
  lastmodifiedat: string // Date
  createdby: string
  createdat: string // Date
  approvedby: string | null
  publishedat: string | null // Date
  // not in MetaRecord
  deletionreason: DeletionReason | null
  archivedreason: ArchivedReason | null
  declinedreasons: DeclinedReason[] | null
  indicativeauditstatus: IndicativeAuditStatus | null
  // specific to assets
  lastsyncedwithgumroadat: string // Date
}

export interface AssetStats {
  endorsementcount: number
  commentcount: number
  reviewcount: number
}

export interface PublicAsset extends Asset {
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
  saleexpiresat: string | null
  speciesnames: string[]
  createdbyusername: string
  lastmodifiedbyusername: string
  linkedassets: Asset[]
  incominglinkedassets: Asset[]
  discordserverdata: DiscordServerData | null
  clonableworlddata: VrchatWorld | null
  relationsdata: Asset[]
  similarassets: Asset[]
  approvedbyusername: string
  tagsdata: Tag[]
  attachmentsdata: FullAttachment[] | null
  publishedbyusername: string
  publishedbyreputation: number
}

export interface SmallAsset extends Asset, AssetMeta {
  createdbyusername: string
  authorname: string
  speciesnames: string[]
  publishedbyusername: string
}

export interface RelatedAssetsResult extends Record<string, unknown> {
  results: Asset[]
}

export interface GetFullAssetCacheItem {
  id: string
  slug: string
  data: FullAsset
  updatedat: string // time
}

export enum CollectionNames {
  Assets = 'assets',
  AssetsMeta = 'assetmeta',
  TagStats = 'tagstats',
}

export enum ViewNames {
  GetFullAssets = 'getfullassets', // FullAsset[]
  GetFullAssetsCache = 'getfullassetscache',
  GetPublicAssets = 'getpublicassets', // PublicAsset[]
  RelatedAssets = 'relatedassets', // RelatedAssetsResult[]
  GetNewPublicAssets = 'getnewpublicassets', // PublicAsset[]-like
  GetAssetTimeline = 'getassettimeline',
  GetCollectionAssetResults = 'getcollectionassetresults',
  GetEndorsementAssetResults = 'getendorsementassetresults',
  GetWishlistAssetResults = 'getwishlistassetresults',
  GetDraftAssets = 'getdraftassets',
}

export enum FunctionNames {
  SearchAssets = 'searchassets',
  GetOrHydrateGetFullAssets = 'get_or_hydrate_getfullassets',
}

export enum FirebaseFunctionNames {
  DeleteDraft = 'deleteDraft',
}
