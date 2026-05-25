import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

import { getNameForAwardId } from './awards'
import { getRouteForTopic, getSubscriptionMessage } from './subscriptions'
import * as routes from './routes'
import { getUserId } from './supabase'
import { CollectionNames as SocialCollectionNames } from './modules/social'
import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from './modules/assets'
import { Author } from './modules/authors'
import { User, CollectionNames as UsersCollectionNames } from './modules/users'
import { CollectionNames as AmendmentsCollectionNames } from './modules/amendments'
import { CollectionNames as ReportsCollectionNames } from './modules/reports'
import { CollectionNames as SpeciesCollectionNames } from './modules/species'
import { CollectionNames as AuthorsCollectionNames } from './modules/authors'
import { CollectionNames as CommentsCollectionNames } from './modules/comments'
import { CollectionNames as WishlistsCollectionNames } from './modules/wishlists'
import { CollectionNames as AttachmentsCollectionNames } from './modules/attachments'
import { CollectionNames as CollectionsCollectionNames } from '@/modules/collections'

export interface CommonRecordFields {
  id: string
  lastmodifiedat: string | null // Date
  lastmodifiedby: string | null
  createdat: string // Date
  createdby: string
}

export interface CommonMetaRecordFields extends Record<string, unknown> {
  editornotes: string
}

export const readRecord = async <TRecord>(
  supabase: SupabaseClient,
  tableName: string,
  id: string,
  defaultVal?: TRecord
): Promise<TRecord> => {
  let query = supabase.from(tableName.toLowerCase()).select('*').eq('id', id)

  const { error, data } = await query

  if (error) throw error

  if (data.length === 0 && defaultVal) {
    return defaultVal
  }

  if (data.length !== 1) {
    throw new Error(
      `Could not get record in table ${tableName} by id ${id}: length is ${data.length}`
    )
  }

  return data[0]
}

export const readRecordsById = async <TRecord>(
  supabase: SupabaseClient,
  tableName: string,
  ids: string[]
): Promise<TRecord[]> => {
  let query = supabase
    .from(tableName)
    .select<'*', TRecord>('*')
    .or(ids.map((id) => `id.eq.${id}`).join(','))

  const { error, data } = await query

  if (error) throw error

  return data
}

export const readAllRecords = async <TRecord>(
  supabase: SupabaseClient,
  tableName: string
): Promise<TRecord[]> => {
  const { error, data } = await supabase.from(tableName).select('*')

  if (error) throw error

  return data
}

export const simpleSearchRecords = async <TRecord>(
  supabase: SupabaseClient,
  tableName: string,
  searchTermsByField: { [fieldName in keyof Partial<TRecord>]: string },
  limit: number = 1000,
  orderBy?: keyof TRecord
): Promise<TRecord[] | null> => {
  let query = supabase
    .from(tableName)
    .select<'*', TRecord>('*')
    .or(
      Object.entries(searchTermsByField)
        .map(([fieldName, searchText]) => `${fieldName}.ilike.${searchText}`)
        .join(',')
    )
    .limit(limit)

  if (orderBy) {
    query = query.order(orderBy as string, { ascending: false })
  }

  const { error, data } = await query

  if (error) throw error

  return data
}

export const updateRecord = async <TFields>(
  supabase: SupabaseClient,
  tableName: string,
  id: string,
  newVal: Partial<TFields>
): Promise<true> => {
  const { error, data } = await supabase
    .from(tableName)
    .update(newVal)
    .eq('id', id)

  console.debug(`updateRecord`, tableName, id, data, error)

  if (error) throw error

  return true
}

export const updateRecords = async <TFields>(
  supabase: SupabaseClient,
  tableName: string,
  ids: string[],
  newVal: Partial<TFields>
): Promise<void> => {
  const { error, data } = await supabase
    .from(tableName)
    .update(newVal)
    .or(ids.map((id) => `id.eq.${id}`).join(','))

  console.debug(`updateRecords`, tableName, ids, data, error)

  if (error) throw error
}

export const insertRecord = async <TFields, TReturnVal>(
  supabase: SupabaseClient,
  tableName: string,
  newVal: TFields,
  selectAfter = false
): Promise<TReturnVal | void> => {
  let query: PostgrestFilterBuilder<any, any, null, unknown> = supabase
    .from(tableName)
    .insert({ ...newVal })

  if (selectAfter) {
    // @ts-ignore
    query = query.select()
  }

  const { error, data } = await query

  console.debug(`insertRecord`, tableName, data, error)

  if (error) throw error

  if (data) {
    return data[0]
  }
}

export const insertRecords = async <TFields, TReturnVal>(
  supabase: SupabaseClient,
  tableName: string,
  newVals: TFields[],
  selectAfter = false
): Promise<TReturnVal[] | void> => {
  let query: PostgrestFilterBuilder<any, any, null, unknown> = supabase
    .from(tableName)
    .insert(newVals)

  if (selectAfter) {
    // @ts-ignore
    query = query.select()
  }

  const { error, data } = await query

  console.debug(`insertRecords`, tableName, data, error)

  if (error) throw error

  if (data) {
    return data
  }
}

export const deleteRecord = async (
  supabase: SupabaseClient,
  tableName: string,
  id: string
): Promise<void> => {
  const { error, data } = await supabase.from(tableName).delete().eq('id', id)

  console.debug(`deleteRecord`, tableName, id, data, error)

  if (error) throw error
}

export const deleteRecordsByUser = async (
  supabase: SupabaseClient,
  tableName: string,
  userId: string
): Promise<void> => {
  const { error, data } = await supabase
    .from(tableName)
    .delete()
    .eq('createdby', userId)

  console.debug(`deleteRecordsByUser`, tableName, userId, data, error)

  if (error) throw error
}

// hooks should extend from this
export interface DataStoreOptions {
  queryName?: string
  // these error codes are completely ignored
  ignoreErrorCodes?: DataStoreErrorCode[]
  // these error codes won't be stored so won't cause re-renders
  unstoreErrorCodes?: DataStoreErrorCode[]
  // these errors won't be captured by Sentry
  uncatchErrorCodes?: DataStoreErrorCode[]
  // defaults to "id" but sometimes want to be quirky
  idField?: string | string[] // array of field names to .eq() on
  select?: string
}

/**
 * ERROR HANDLING STUFF...
 */

// the standard way of passing around errors is the "Error" class (not the Postgres error object)
// this just wraps it all up nicely
export class DataStoreError extends Error {
  postgrestError?: PostgrestError
  constructor(message: string, postgrestError?: PostgrestError) {
    super(`${message}${postgrestError ? `: ${postgrestError.message}` : ''}`)
    this.postgrestError = postgrestError
  }
}

// handle a PATCH but postgres returns success with 0 results which is confusing
export class DataStoreUpdateError extends DataStoreError { }

// Source: https://docs.postgrest.org/en/v12/references/errors.html
// NOTE: cannot have numeric keys so standard postgres errors prefixed with "PG" (vs "PGRST" for Postgrest)
export enum PostgresErrorCode {
  // code: "PGRST103", details: "An offset of 200 was requested, but there are only 33 rows.", hint: null, message: "Requested range not satisfiable"
  PGRST103 = 'PGRST103',
  // code: "23505", details: null, hint: null, message: 'duplicate key value violates unique constraint "users_username_key"'
  'PG23505' = '23505',
  'PGRST303' = 'PGRST303' // code 'PGRST303' message 'JWT expired'
}

// we should never store complex objects in state (hard to persist, reference issues, etc.)
// so we prefer error codes
// we cannot use Supabase's error codes in case we switch providers (which we have done once before)
// so use these internal error codes
export enum DataStoreErrorCode {
  AuthExpired,
  ViolateUniqueConstraint,
  BadRange,
  Unknown,
  ChannelError,
  FailedToUpdate,
}

export const getDataStoreErrorCodeFromPostgrestError = (
  postgresError: PostgrestError
): DataStoreErrorCode => {
  switch (postgresError.code) {
    case PostgresErrorCode.PGRST103:
      return DataStoreErrorCode.BadRange
    case PostgresErrorCode.PG23505:
      return DataStoreErrorCode.ViolateUniqueConstraint
    case PostgresErrorCode.PGRST303:
      return DataStoreErrorCode.AuthExpired
  }

  return DataStoreErrorCode.Unknown
}

export const getDataStoreErrorCodeFromError = (
  errorThing: unknown
): DataStoreErrorCode => {
  if (errorThing instanceof DataStoreUpdateError) {
    return DataStoreErrorCode.FailedToUpdate
  }

  // must be 2nd as above error extends from it
  if (errorThing instanceof DataStoreError) {
    return getDataStoreErrorCodeFromPostgrestError(errorThing.postgrestError!)
  }

  if (errorThing instanceof PostgrestError) {
    return getDataStoreErrorCodeFromPostgrestError(errorThing)
  }

  return DataStoreErrorCode.Unknown
}

export type GetQuery<TRecord> = PostgrestFilterBuilder<any, any, TRecord[]>

export const escapeValue = (value: string): string => {
  const reservedChars = [',', '.', ':', '(', ')']

  if (reservedChars.some((char) => value.includes(char))) {
    return `%22${value}%22`
  }

  return value
}

export const getParentLabel = (
  parentTable: string,
  parentId: string
): string => {
  switch (parentTable) {
    case AssetsCollectionNames.Assets:
      return 'asset'
    case AssetsCollectionNames.AssetsMeta:
      return 'asset metadata'

    case CommentsCollectionNames.Comments:
      return 'comment'
    case CommentsCollectionNames.CommentsMeta:
      return 'comment metadata'

    case AuthorsCollectionNames.Authors:
      return 'author'
    case AuthorsCollectionNames.AuthorsMeta:
      return 'author metadata'

    case UsersCollectionNames.Users:
      return 'user'
    case UsersCollectionNames.UsersMeta:
      return 'user metadata'
    case UsersCollectionNames.UsersAdminMeta:
      return 'user admin metadata'

    case AttachmentsCollectionNames.Attachments:
      return 'attachment'
    case AttachmentsCollectionNames.AttachmentsMeta:
      return 'attachment metadata'

    case WishlistsCollectionNames.WishlistsForUsers:
      return 'wishlist'

    case SpeciesCollectionNames.Species:
      return 'comment'
    // case SpeciesCollectionNames.SpeciesMeta:
    //   return 'comment metadata'

    case UsersCollectionNames.UserPreferences:
      return 'user preferences'

    case CollectionsCollectionNames.Collections:
      return 'collection'

    default:
      return `Parent: ${parentTable}.${parentId}`

    // return routes.viewAmendmentWithVar.replace(':amendmentId', parentId)
  }
}
