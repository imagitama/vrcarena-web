import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { client as supabase } from './supabase'
import { getIsUuid } from './utils'

const standardFieldNames = {
  id: 'id'
}

export const CollectionNames = {
  Events: 'events',
  EventsMeta: 'eventsmeta',
  Analytics: 'analytics',
  CommentsMeta: 'commentsmeta',
  AuthorsMeta: 'authorsmeta',
  DiscordServersMeta: 'discordserversmeta',
  Playlists: 'playlists',
  PlaylistsMeta: 'playlistsMeta',
  Pages: 'pages',
  PageParents: 'pageparents',
  PublicAvatarSubmissions: 'publicavatarsubmissions',
  Amendments: 'amendments',
  AmendmentsMeta: 'amendmentsmeta',
  UserPreferences: 'userpreferences'
}

export const SpecialFieldNames = {
  // SQL doesn't let us store arbitrary columns so dump it all in a JSONB column named "value"
  value: 'value',
  lastModifiedAt: 'lastmodifiedat',
  lastModifiedBy: 'lastmodifiedby'
}

export const FeaturedAssetsFieldNames = {
  activeAsset: 'activeAsset',
  rotation: 'rotation',
  alreadyFeaturedAssets: 'alreadyFeaturedAssets'
  // overrideAsset: 'overrideAsset'
}

export const CommonFieldNames = {
  isDeleted: 'isdeleted', // should not be here - instead use accessStatus column!
  ownedBy: 'ownedby', // should not be here
  lastModifiedAt: 'lastmodifiedat',
  lastModifiedBy: 'lastmodifiedby',
  createdAt: 'createdat',
  createdBy: 'createdby'
}

export const CommonMetaFieldNames = {
  editorNotes: 'editornotes',
  publishStatus: 'publishstatus', // published | draft
  publishedBy: 'publishedby', // user ref
  accessStatus: 'accessstatus',
  approvalStatus: 'approvalstatus',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat',
  createdBy: 'createdby',
  createdAt: 'createdat',
  approvedAt: 'approvedat',
  approvedBy: 'approvedby'
}

export const GetFullPlaylistFieldNames = {
  assets: 'itemsassetdata' // TODO: rename
}

export const GetFullUsersFieldNames = {
  favoriteSpeciesData: 'favoritespeciesdata'
}

export const GetFullReportsFieldNames = {
  CreatedByUsername: 'createdbyusername'
}

export const ReviewsFieldNames = {
  asset: 'asset',
  overallRating: 'overallrating', // number - out of 10
  comments: 'comments',
  ratings: 'ratings', // jsonb { ratings: [] }
  lastModifiedAt: 'lastmodifiedat',
  lastModifiedBy: 'lastmodifiedby',
  createdAt: 'createdat',
  createdBy: 'createdby'
}

export const ReviewsRatingsFieldNames = {
  name: 'name',
  rating: 'rating', // number - out of 10
  comments: 'comments'
}

export const AttachmentsMetaFieldNames = {
  relevance: 'relevance',
  approvalStatus: 'approvalstatus',
  accessStatus: 'accessstatus',
  createdBy: 'createdby',
  createdAt: 'createdat',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat'
}

export const TweetsFieldNames = {
  status: 'status',
  tweetId: 'tweetid',
  tweetedAt: 'tweetedat',
  createdAt: 'createdat'
}

export const TweetQueueFieldNames = {
  status: 'status',
  asset: 'asset',
  queuedAt: 'queuedat'
}

export const EventsFieldNames = {
  id: 'id',
  name: 'name',
  description: 'description',
  sourceUrl: 'sourceurl',
  thumbnailUrl: 'thumbnailurl',
  bannerUrl: 'bannerurl',
  attachmentIds: 'attachmentids',
  speciesIds: 'speciesids',
  assetIds: 'assetids',
  discordServerId: 'discordserverid',
  isAdult: 'isadult',
  startsAt: 'startsat',
  endsAt: 'endsat',
  assetTags: 'assettags',
  lastModifiedAt: 'lastmodifiedat',
  lastModifiedBy: 'lastmodifiedby',
  createdAt: 'createdat',
  createdBy: 'createdby'
}

export const EventsMetaFieldNames = {
  id: 'id',
  approvalStatus: 'approvalstatus',
  accessStatus: 'accessstatus',
  lastModifiedAt: 'lastmodifiedat',
  lastModifiedBy: 'lastmodifiedby',
  createdAt: 'createdat',
  createdBy: 'createdby'
}

export const AnalyticsFieldNames = {
  category: 'category',
  action: 'action',
  parentTable: 'parenttable',
  parent: 'parent',
  extraData: 'extradata',
  createdAt: 'createdat',
  createdBy: 'createdby'
}

export const SubscriptionsFieldNames = {
  parent: 'parent',
  parentTable: 'parenttable',
  topics: 'topics',
  createdAt: 'createdat',
  createdBy: 'createdby',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat'
}

export const PlaylistsFieldNames = {
  title: 'title',
  description: 'description',
  thumbnailUrl: 'thumbnailurl',
  items: 'items',
  createdAt: 'createdat',
  createdBy: 'createdby',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat'
}

export const PlaylistItemsFieldNames = {
  asset: 'asset',
  comments: 'comments'
}

export const PageParentsFieldNames = {
  id: 'id',
  title: 'title',
  description: 'description',
  thumbnailUrl: 'thumbnailurl',
  bannerUrl: 'bannerurl',
  createdBy: 'createdby',
  createdAt: 'createdat',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat'
}

export const PagesFieldNames = {
  id: 'id',
  parent: 'parent',
  pageOrder: 'pageorder',
  title: 'title',
  description: 'description',
  content: 'content',
  createdBy: 'createdby',
  createdAt: 'createdat',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat'
}

export const query = <TRecord>(
  collectionName: string,
  selectFieldNames: string,
  where: { [key: string]: string },
  settings: { startAt?: number; limit?: number } = {}
): PostgrestFilterBuilder<TRecord> => {
  let queryChain = supabase.from(collectionName).select(selectFieldNames || '*')

  if (getIsUuid(selectFieldNames)) {
    console.log('it is a uuid!', selectFieldNames)
    queryChain = queryChain.eq(standardFieldNames.id, selectFieldNames)
  }

  for (const [key, value] of Object.entries(where)) {
    queryChain = queryChain.eq(key, value)
  }

  if (settings.startAt && settings.limit) {
    queryChain = queryChain.range(settings.startAt, settings.limit)
  } else if (settings.limit) {
    queryChain = queryChain.limit(settings.limit)
  }

  return queryChain
}

export const readRecord = async <TRecord>(
  tableName: string,
  id: string,
  defaultVal?: TRecord
): Promise<TRecord> => {
  const { error, data } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', id)

  if (error) {
    console.error(error)
    throw new Error(
      `Could not get record in table ${tableName} by id ${id}: ${error.code} ${
        error.message
      } (${error.hint})`
    )
  }

  if (data.length === 0 && defaultVal) {
    return defaultVal
  }

  if (data.length !== 1) {
    throw new Error(
      `Could not get record in table ${tableName} by id ${id}: length is ${
        data.length
      }`
    )
  }

  return data[0]
}

export const readAllRecords = async <TRecord>(
  tableName: string
): Promise<TRecord[]> => {
  const { error, data } = await supabase.from(tableName).select('*')

  if (error) {
    console.error(error)
    throw new Error(
      `Could not read all records from table ${tableName}: ${error.code} ${
        error.message
      } (${error.hint})`
    )
  }

  return data
}

export const simpleSearchRecords = async (
  tableName: string,
  searchTermsByField: { [fieldName: string]: string } = {},
  limit: number = 1000
) => {
  const { error, data } = await supabase
    .from(tableName)
    .select('*')
    .or(
      Object.entries(searchTermsByField)
        .map(([fieldName, searchText]) => `${fieldName}.ilike.${searchText}`)
        .join(',')
    )
    .limit(limit)

  if (error) {
    console.error(error)
    throw new Error(
      `Could not simple search records in table ${tableName}: ${error.code} ${
        error.message
      } (${error.hint})`
    )
  }

  return data
}

export const updateRecord = async <TFields>(
  tableName: string,
  id: string,
  newVal: TFields
): Promise<true> => {
  const { error, data } = await supabase
    .from(tableName)
    .update(newVal)
    .eq('id', id)

  console.debug(`updateRecord`, tableName, id, data, error)

  // returns an error per record (which is 1)
  if (error) {
    let errorToReport

    if (Array.isArray(error)) {
      if (error.length > 0) {
        console.error(error)
        errorToReport = error[0]
      } else {
        return true
      }
    } else {
      errorToReport = error
    }

    throw new Error(
      `Could not update record in table ${tableName} by id ${id}: ${
        errorToReport.code
      } ${errorToReport.message} (${errorToReport.hint})`
    )
  }

  return true
}

export const updateRecords = async <TFields>(
  tableName: string,
  ids: string[],
  newVal: TFields
): Promise<true> => {
  const { error, data } = await supabase
    .from(tableName)
    .update(newVal)
    .or(ids.map(id => `id.eq.${id}`).join(','))

  console.debug(`updateRecords`, tableName, ids, data, error)

  if (error) {
    let errorToReport

    if (Array.isArray(error)) {
      if (error.length > 0) {
        console.error(error)
        errorToReport = error[0]
      } else {
        return true
      }
    } else {
      errorToReport = error
    }

    throw new Error(
      `Could not update records in table ${tableName} by ids: ${
        errorToReport.code
      } ${errorToReport.message} (${errorToReport.hint})`
    )
  }

  return true
}

export const insertRecord = async <TFields, TReturnVal>(
  tableName: string,
  newVal: TFields,
  minimal = true
): Promise<TReturnVal> => {
  // const id = generateUid()
  const { error, data } = await supabase
    .from(tableName)
    // returning = minimal so it does not perform a SELECT which might not work because of security
    .insert(
      { ...newVal },
      { returning: minimal ? 'minimal' : 'representation' }
    )

  console.debug(`insertRecord`, tableName, data, error)

  // returns an error per record (which is 1)
  if (error && Array.isArray(error) && error.length > 0) {
    console.error(error)
    const firstError = error[0]
    throw new Error(
      `Could not insert record in table ${tableName}: ${firstError.code} ${
        firstError.message
      } (${firstError.hint})`
    )
  } else if (error) {
    throw new Error(
      `Could not insert record in table ${tableName}: ${error.code} ${
        error.message
      } (${error.hint})`
    )
  }

  // TODO: Do we need to get this? It will mean running SELECT but that could clash with security policies
  // @ts-ignore
  return minimal ? null : (data[0] as TReturnVal)
}

export const deleteRecord = async (
  tableName: string,
  id: string
): Promise<null> => {
  const { error, data } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id)

  console.debug(`deleteRecord`, tableName, id, data, error)

  // returns an error per record (which is 1)
  if (error && Array.isArray(error) && error.length > 0) {
    console.error(error)
    const firstError = error[0]
    throw new Error(
      `Could not delete record in table ${tableName}: ${firstError.code} ${
        firstError.message
      } (${firstError.hint})`
    )
  } else if (error) {
    throw new Error(
      `Could not delete record in table ${tableName}: ${error.code} ${
        error.message
      } (${error.hint})`
    )
  }

  // TODO: Do we need to get this? It will mean running SELECT but that could clash with security policies
  return null
}
