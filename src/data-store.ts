import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

export interface CommonRecordFields {
  id: string
  lastmodifiedat: Date | null
  lastmodifiedby: string | null
  createdat: Date
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

  if (error) {
    console.error(error)
    throw new Error(
      `Could not get record in table ${tableName} by id ${id}: ${error.code} ${error.message} (${error.hint})`
    )
  }

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

  if (error) {
    console.error(error)
    throw new Error(
      `Could not get records in table ${tableName} by ids ${ids.join(', ')}: ${
        error.code
      } ${error.message} (${error.hint})`
    )
  }

  return data
}

export const readAllRecords = async <TRecord>(
  supabase: SupabaseClient,
  tableName: string
): Promise<TRecord[]> => {
  const { error, data } = await supabase.from(tableName).select('*')

  if (error) {
    console.error(error)
    throw new Error(
      `Could not read all records from table ${tableName}: ${error.code} ${error.message} (${error.hint})`
    )
  }

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

  if (error) {
    console.error(error)
    throw new Error(
      `Could not simple search records in table ${tableName}: ${error.code} ${error.message} (${error.hint})`
    )
  }

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
      `Could not update record in table ${tableName} by id ${id}: ${errorToReport.code} ${errorToReport.message} (${errorToReport.hint})`
    )
  }

  return true
}

export const updateRecords = async <TFields>(
  supabase: SupabaseClient,
  tableName: string,
  ids: string[],
  newVal: TFields
): Promise<true> => {
  const { error, data } = await supabase
    .from(tableName)
    .update(newVal)
    .or(ids.map((id) => `id.eq.${id}`).join(','))

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
      `Could not update records in table ${tableName} by ids: ${errorToReport.code} ${errorToReport.message} (${errorToReport.hint})`
    )
  }

  return true
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

  // returns an error per record (which is 1)
  if (error && Array.isArray(error) && error.length > 0) {
    console.error(error)
    const firstError = error[0]
    throw new Error(
      `Could not insert record in table ${tableName}: ${firstError.code} ${firstError.message} (${firstError.hint})`
    )
  } else if (error) {
    throw new Error(
      `Could not insert record in table ${tableName}: ${error.code} ${error.message} (${error.hint})`
    )
  }

  if (data) {
    return data[0]
  }
}

export const deleteRecord = async (
  supabase: SupabaseClient,
  tableName: string,
  id: string
): Promise<void> => {
  const { error, data } = await supabase.from(tableName).delete().eq('id', id)

  console.debug(`deleteRecord`, tableName, id, data, error)

  // returns an error per record (which is 1)
  if (error && Array.isArray(error) && error.length > 0) {
    console.error(error)
    const firstError = error[0]
    throw new Error(
      `Could not delete record in table ${tableName}: ${firstError.code} ${firstError.message} (${firstError.hint})`
    )
  } else if (error) {
    throw new Error(
      `Could not delete record in table ${tableName}: ${error.code} ${error.message} (${error.hint})`
    )
  }
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
export class DataStoreUpdateError extends DataStoreError {}

// Source: https://docs.postgrest.org/en/v12/references/errors.html
// NOTE: cannot have numeric keys so standard postgres errors prefixed with "PG" (vs "PGRST" for Postgrest)
export enum PostgresErrorCode {
  // code: "PGRST103", details: "An offset of 200 was requested, but there are only 33 rows.", hint: null, message: "Requested range not satisfiable"
  PGRST103 = 'PGRST103',
  // code: "23505", details: null, hint: null, message: 'duplicate key value violates unique constraint "users_username_key"'
  'PG23505' = '23505',
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
