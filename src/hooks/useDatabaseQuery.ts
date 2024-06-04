import { useEffect, useRef, useState } from 'react'
import { inDevelopment } from '../environment'
import { handleError } from '../error-handling'
import { client as supabase } from '../supabase'

export enum Operators {
  IS = 'IS', // works for NULL vals
  EQUALS = 'eq',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  ARRAY_CONTAINS = 'array-contains',
}

export enum WhereOperators {
  OR,
}

export enum OrderDirections {
  ASC,
  DESC,
}

export enum PublishStatuses {
  Published = 'published',
  Draft = 'draft',
}

export enum AccessStatuses {
  Public = 'public',
  Deleted = 'deleted',
}

export enum ApprovalStatuses {
  Approved = 'approved',
  Waiting = 'waiting',
  Declined = 'declined',
}

export enum PinnedStatuses {
  Pinned = 'pinned',
  Unpinned = 'unpinned',
}

export const CollectionNames = {
  Notices: 'notices',
  Endorsements: 'endorsements',
  Profiles: 'profiles',
  Mail: 'mail',
  Downloads: 'downloads',
  Requests: 'requests',
  Notifications: 'notifications',
  AwardsForUsers: 'awardsforusers',
  DiscordUsers: 'discordusers',
  WishlistsForUsers: 'wishlistsforusers',
  CollectionsForUsers: 'collectionsforusers',
  // special
  Summaries: 'summaries',
  Special: 'special',
  History: 'history',
  EditorHistory: 'editorhistory',
  // users
  UserAdminMeta: 'useradminmeta',
  Users: 'users',
  // assets
  Assets: 'assets',
  AssetMeta: 'assetmeta',
  AssetEditorMeta: 'asseteditormeta',
  // comments
  Comments: 'comments',
  // admin stuff
  Reports: 'reports',
  // polls
  Polls: 'polls',
  PollResponses: 'pollresponses',
  PollTallies: 'polltallies',
  Authors: 'authors',
  Likes: 'likes',
  Species: 'species',
  UserMeta: 'usermeta',
  DiscordMessages: 'discordmessages',
  // other
  VrchatAvatars: 'vrchatavatars',
  VrchatWorlds: 'vrchatworlds',
  Reviews: 'reviews',
  Attachments: 'attachments',
  // subscriptions
  Subscriptions: 'subscriptions',
  DiscordServers: 'discordservers',
}

export const VrchatAvatarsFieldNames = {
  avatar: 'avatar',
  fetchedAt: 'fetchedat',
}

export const VrchatWorldsFieldNames = {
  world: 'world',
  fetchedAt: 'fetchedat',
}

export const CollectionFieldNames = {
  assets: 'assets',
  createdBy: 'createdby',
  createdAt: 'createdat',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat',
}

export const UploadsFieldNames = {
  assets: 'assets', // need to store refs in this array for easy queries
  uploads: 'uploads',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
}

export const UploadItemFieldNames = {
  parent: 'parent',
  type: 'type',
  url: 'url',
  thumbnailUrl: 'thumbnailUrl',
}

export const UploadItemTypes = {
  IMAGE: 'image',
  VIDEO: 'video',
  YOUTUBE_VIDEO: 'youtube_video',
}

export const WishlistFieldNames = {
  assets: 'assets',
  createdBy: 'createdby',
  createdAt: 'createdat',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat',
}

export const AwardsForUsersFieldNames = {
  awards: 'awards',
}

export const ReportFieldNames = {
  parentTable: 'parenttable',
  parent: 'parent',
  reason: 'reason',
  comments: 'comments',
  isVerified: 'isverified',
  isDeleted: 'isdeleted',
  createdBy: 'createdby',
  createdAt: 'createdat',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat',
}

export const ViewCacheNames = {
  CategoryAccessory: 'CategoryAccessory',
  ViewAllSpecies: 'ViewAllSpecies',
}

export const specialCollectionIds = {
  featured: 'featured', // TODO: Remove
  featuredAssets: 'featuredAssets',
  homepage: 'homepage',
  avatarList: 'avatarList',
  avatarList1: 'avatarList1', // docs have a 1mb limit and we've hit that so a temporary workaround
  avatarList2: 'avatarList2', // docs have a 1mb limit and we've hit that so a temporary workaround
}

export const AvatarListFieldNames = {
  avatars: 'avatars',
  lastModifiedAt: 'lastModifiedAt',
  species: 'species',
}

export const FeaturedStatuses = {
  Featured: 'featured',
  Unfeatured: 'unfeatured',
}

/** START ASSETS */

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
  attachmentids: 'attachmentids',
}

export const AssetGumroadFields = {
  sync: 'sync',
  fields: 'fields',
}

export const AssetMetaFieldNames = {
  editorNotes: 'editornotes',
  publishStatus: 'publishstatus', // published | draft
  publishedBy: 'publishedby', // user ref
  accessStatus: 'accessstatus',
  approvalStatus: 'approvalstatus',
  pinnedStatus: 'pinnedstatus',
  featuredStatus: 'featuredstatus',
  featuredBy: 'featuredby',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat',
  createdBy: 'createdby',
  createdAt: 'createdat',
  lastSyncedWithGumroadAt: 'lastsyncedwithgumroadat',
  approvedAt: 'approvedat',
  publishedAt: 'publishedat',
  approvedBy: 'approvedby',
}

export const AssetEditorMetaFieldNames = {
  notes: 'notes',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
}

export const GetPublicAssetsFieldNames = {
  authorName: 'authorname',
}

export const GetFullAssetsFieldNames = {
  ...AssetFieldNames,
  ...AssetMetaFieldNames,

  // comments: 'comments',
  authorName: 'authorname',
  speciesNames: 'speciesnames',
  createdByUsername: 'createdbyusername',
  lastModifiedByUsername: 'lastmodifiedbyusername',
  linkedAssets: 'linkedassets',
  incomingLinkedAssets: 'incominglinkedassets',
  lastModifiedAt: 'lastmodifiedat',
  product: 'product',
  contentAssets: 'contentassets',
  discordServerData: 'discordserverdata',
  clonableWorldData: 'clonableworlddata',
  childrenData: 'childrendata',

  // stats
  endorsementCount: 'endorsementcount',
  commentCount: 'commentcount',
  reviewCount: 'reviewcount',
}

/** END ASSETS */

export const TutorialStepFieldNames = {
  number: 'number', // 1 onwards
  title: 'title',
  description: 'description',
  imageUrls: 'imageUrls', // todo: rename to imageUrl
  youtubeUrl: 'youtubeUrl',
}

export const UserFieldNames = {
  // basic stuff
  username: 'username',
  avatarUrl: 'avatarurl',
  favoriteSpecies: 'favoritespecies',

  // profile
  vrchatUserId: 'vrchatuserid',
  vrchatUsername: 'vrchatusername',
  discordUsername: 'discordusername',
  twitterUsername: 'twitterusername',
  telegramUsername: 'telegramusername',
  youtubeChannelId: 'youtubechannelid',
  twitchUsername: 'twitchusername',
  bio: 'bio',
  neosVrUsername: 'neosvrusername',
  chilloutVrUsername: 'chilloutvrusername',
  patreonUsername: 'patreonusername',

  // meta
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat',
  createdBy: 'createdby',
  createdAt: 'createdat',
}

export const UserMetaFieldNames = {
  discordUserId: 'discorduserid',
  patreonStatus: 'patreonstatus', // "patron" | "not_patron" | "unknown"
  patreonUserId: 'patreonuserid',
  patreonRewardIds: 'patreonrewardids',
  banStatus: 'banstatus', // "banned" | "unbanned"
  banReason: 'banreason',
  lastModifiedAt: 'lastmodifiedat',
  lastModifiedBy: 'lastmodifiedby',
  createdBy: 'createdby',
  createdAt: 'createdat',
}

export const PatreonStatuses = {
  Patron: 'patron',
  NotPatron: 'not_patron',
  Unknown: 'unknown',
}

export const BanStatuses = {
  Banned: 'banned',
  Unbanned: 'unbanned',
}

export const UserAdminMetaFieldNames = {
  role: 'role', // "user" | "editor" | "admin"
  lastModifiedAt: 'lastmodifiedat',
  lastModifiedBy: 'lastmodifiedby',
}

export const UserRoles = {
  User: 'user',
  Editor: 'editor',
  Admin: 'admin',
}

export const UserCacheFieldNames = {
  ...UserFieldNames,
  ...UserMetaFieldNames,
  ...UserAdminMetaFieldNames,
  favoriteSpecies: 'favoriteSpecies', // UserFieldNames has one too
  lastModifiedAt: 'lastModifiedAt',
  lastModifiedBy: 'lastModifiedBy',
}

export const CommentFieldNames = {
  comment: 'comment',
  parentTable: 'parenttable',
  parent: 'parent',
  createdAt: 'createdat',
  createdBy: 'createdby',
  // isDeleted: 'isdeleted', // deprecated
  isPrivate: 'isprivate',
  lastModifiedAt: 'lastmodifiedat',
  lastModifiedBy: 'lastmodifiedby',
}

export const HistoryFieldNames = {
  createdAt: 'createdat',
  createdBy: 'createdby',
  parentTable: 'parenttable',
  parent: 'parent',
  message: 'message',
  data: 'data',
}

export const EndorsementFieldNames = {
  asset: 'asset',
  createdBy: 'createdby',
  createdAt: 'createdat',
}

export const DownloadsFieldNames = {
  asset: 'asset',
  createdBy: 'createdby',
  createdAt: 'createdat',
}

export const NotificationsFieldNames = {
  recipient: 'recipient',
  message: 'message',
  parent: 'parent',
  parentTable: 'parenttable',
  isRead: 'isread',
  data: 'data',
  createdAt: 'createdat',
}

export const AuthorFieldNames = {
  name: 'name',
  description: 'description',
  websiteUrl: 'websiteurl',
  email: 'email',
  twitterUsername: 'twitterusername',
  gumroadUsername: 'gumroadusername',
  discordUsername: 'discordusername',
  discordServerInviteUrl: 'discordserverinviteurl',
  patreonUsername: 'patreonusername',
  categories: 'categories',
  createdAt: 'createdat',
  createdBy: 'createdby',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat',
  discordServerId: 'discordserverid',
  isOpenForCommission: 'isopenforcommission',
  commissionInfo: 'commissioninfo',
  showCommissionStatusForAssets: 'showcommissionstatusforassets',
  avatarUrl: 'avatarurl',
  bannerUrl: 'bannerurl',
  boothUsername: 'boothusername',
  saleReason: 'salereason',
  saleDescription: 'saledescription',
  saleExpiresAt: 'saleexpiresat',
  // deprecated
  ownedBy: 'ownedby',
  inheritFields: 'inheritfields',
  isDeleted: 'isdeleted',
}

export const DiscordServerFieldNames = {
  name: 'name',
  description: 'description',
  widgetId: 'widgetid',
  iconUrl: 'iconurl',
  inviteUrl: 'inviteurl',
  requiresPatreon: 'requirespatreon',
  patreonUrl: 'patreonurl',
  species: 'species',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat',
  createdAt: 'createdat',
  createdBy: 'createdby',
  isApproved: 'isapproved',
  isDeleted: 'isdeleted',
}

export const SpeciesFieldNames = {
  singularName: 'singularname',
  pluralName: 'pluralname',
  description: 'description',
  shortDescription: 'shortdescription',
  thumbnailUrl: 'thumbnailurl',
  fallbackThumbnailUrl: 'fallbackthumbnailurl',
  thumbnailSourceUrl: 'thumbnailsourceurl',
  isPopular: 'ispopular',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat',
  createdAt: 'createdat',
  createdBy: 'createdby',
  slug: 'slug',
  parent: 'parent',
  redirectTo: 'redirectto',
}

export const HomepageFieldNames = {
  lastUpdatedAt: 'lastupdatedat',
  siteStats: 'siteStats',
  patreon: 'patreon',
}

export function getWhereClausesAsString(
  whereClauses: PossibleWhereClauses
): string {
  if (whereClauses === undefined) {
    return 'undefined'
  }
  if (whereClauses === false) {
    return 'false'
  }
  if (getIsGettingSingleRecord(whereClauses)) {
    return whereClauses.toString()
  }
  if (Array.isArray(whereClauses)) {
    return whereClauses
      .map((item) =>
        Array.isArray(item) ? `[${item[0]},${item[1]},${item[2]}]` : item
      )
      .join(',')
  }
  return whereClauses
}

interface DatabaseResult {
  id: string
}

function getStartAfterAsString(startAfter: DatabaseResult | undefined): string {
  if (!startAfter) {
    return ''
  }
  return startAfter.id
}

function getIsGettingSingleRecord(whereClauses: any): boolean {
  return typeof whereClauses === 'string'
}

function getLimitAsString(limit: number | undefined): string {
  if (!limit) {
    return ''
  }
  return limit.toString()
}

export function getOrderByAsString(orderBy?: OrderBy): string {
  if (!orderBy) {
    return ''
  }
  return orderBy.join('+')
}

export const options = {
  limit: 'limit',
  orderBy: 'orderBy',
  subscribe: 'subscribe',
  startAfter: 'startAfter',
  queryName: 'queryName',
  // SQL
  offset: 'offset',
  selectQuery: 'selectQuery',
  // special
  supabase: 'supabase',
}

const getOptionsIfProvided = (
  maybeOptions: OptionsMap | number | undefined
): OptionsMap | false => {
  if (typeof maybeOptions === 'object') {
    return maybeOptions
  } else {
    return false
  }
}

export type WhereClause = [string, Operators, string | boolean | null]

type OrderBy = [string, OrderDirections]

interface OptionsMap {
  queryName?: string
  limit?: number
  startAfter?: DatabaseResult
  orderBy?: OrderBy
  offset?: number
  supabase?: {
    foreignTable?: string
  }
  selectQuery?: string
  subscribe?: boolean // not supported in supabase (without setup)
}

type PossibleWhereClauses = (WhereClause | string | WhereOperators.OR)[] | false

export default <TResult>(
  collectionName: string,
  whereClauses: PossibleWhereClauses,
  limitOrOptions?: number | OptionsMap,
  orderBy?: OrderBy,
  subscribe = true,
  startAfter = undefined
): [boolean, boolean, TResult[] | null, () => void] => {
  if (typeof whereClauses === 'string') {
    throw new Error('Cannot pass id to this hook anymore')
  }

  const [records, setRecords] = useState<TResult[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isErrored, setIsErrored] = useState(false)
  const isUnmountedRef = useRef(false)

  const options: OptionsMap = getOptionsIfProvided(limitOrOptions) || {
    limit: typeof limitOrOptions === 'number' ? limitOrOptions : undefined,
    orderBy,
    subscribe,
    startAfter,
  }

  const whereClausesAsString = getWhereClausesAsString(whereClauses)
  const orderByAsString = getOrderByAsString(options.orderBy)
  const startAfterAsString = getStartAfterAsString(options.startAfter)
  const limitAsString = getLimitAsString(options.limit)
  const offset = options.offset

  async function doIt(initiallyLoading = true) {
    try {
      if (inDevelopment()) {
        console.debug(
          'useDatabaseQuery',
          collectionName,
          whereClausesAsString,
          limitAsString,
          orderByAsString,
          startAfterAsString,
          options.queryName
        )
      }

      if (initiallyLoading) {
        setIsLoading(true)
        setIsErrored(false)
      }

      const selectQuery = options.selectQuery || '*'

      let queryChain = supabase
        .from(collectionName.toLowerCase())
        .select(selectQuery)

      // or an array of searches
      if (Array.isArray(whereClauses)) {
        const isOrStatement = whereClauses.find(
          (item) => item === WhereOperators.OR
        )

        if (isOrStatement) {
          const orStatement = whereClauses
            .filter((item) => typeof item !== 'string')
            .map(
              // @ts-ignore
              ([field, operator, value]: WhereClause) =>
                `${field}.${operator}.${value}`
            )
            .join(',')

          console.debug(`or statement`, orStatement)

          if (options.supabase) {
            console.debug(`foreignTable=${options.supabase.foreignTable}`)
          }

          queryChain = queryChain.or(
            orStatement,
            options.supabase
              ? {
                  foreignTable: options.supabase.foreignTable,
                }
              : {}
          )
        } else {
          // @ts-ignore
          for (const [field, operator, value] of whereClauses) {
            switch (operator) {
              case Operators.NOT_EQUALS:
                // @ts-ignore
                queryChain = queryChain.not(field, 'eq', value)
                break
              case Operators.IS:
                // supports "IS NULL" SQL operator
                queryChain = queryChain.is(field, value)
                break
              case Operators.GREATER_THAN:
                queryChain = queryChain.gt(field, value)
                break
              case Operators.ARRAY_CONTAINS:
                const valueToUse = Array.isArray(value) ? value : [value]
                queryChain = queryChain.contains(field, valueToUse)
                break
              default:
                queryChain = queryChain.filter(field, operator, value)
            }
          }
        }
        // or undefined - all results
      } else {
      }

      if (options.limit) {
        queryChain = queryChain.limit(options.limit)
      }

      if (options.orderBy) {
        queryChain = queryChain.order(options.orderBy[0], {
          ascending: options.orderBy[1] === OrderDirections.ASC,
        })
      }

      if (options.offset && options.limit) {
        queryChain = queryChain.range(
          options.offset,
          options.offset + options.limit
        )
      }

      const result = await queryChain

      console.debug(
        `Result of query ${options.queryName || 'unnamed'}:`,
        result
      )

      if (isUnmountedRef.current) {
        console.debug(
          `Query complete but component has unmounted, skipping re-render...`
        )
        return
      }

      if (result.error) {
        if (result.error.message.includes('JWT expired')) {
          setIsLoading(false)
          setIsErrored(true)
        } else {
          throw new Error(
            `Failed to query database! ${result.error.code}: ${result.error.message}`
          )
        }
      } else {
        // weird timing issue where loading=false but users=null so set it before the other flags
        setRecords(result.data)
        setIsLoading(false)
        setIsErrored(false)
      }
    } catch (err) {
      console.error('Failed to use database query', err)
      setIsLoading(false)
      setIsErrored(true)
      handleError(err)
    }
  }

  useEffect(() => {
    // fix setting state on unmounted component
    isUnmountedRef.current = false

    if (whereClauses === false) {
      setIsLoading(false)

      return () => {
        isUnmountedRef.current = true
      }
    }

    doIt()

    return () => {
      isUnmountedRef.current = true
    }
  }, [
    collectionName,
    whereClausesAsString,
    orderByAsString,
    startAfterAsString,
    limitAsString,
    offset,
    options.supabase && options.supabase.foreignTable,
  ])

  const hydrate = () => {
    if (whereClauses === false) {
      return
    }
    doIt(false)
  }

  return [isLoading, isErrored, records, hydrate]
}
