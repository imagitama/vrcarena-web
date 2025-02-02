import { useEffect, useRef, useState, useCallback } from 'react'
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import { handleError } from '../error-handling'
import { inDevelopment } from '../environment'
import {
  DataStoreErrorCode,
  DataStoreOptions,
  GetQuery,
  PostgresErrorCode,
  getDataStoreErrorCodeFromError,
} from '../data-store'
import useSupabaseClient from './useSupabaseClient'

/**
 * TODO: Decide if to delete this hook and return to useDatabaseQuery as it abstracts Supabase
 */

export interface UseDataStoreOptions extends DataStoreOptions {
  quietHydrate?: boolean
}

const getOptions = (
  queryNameOrOptions: string | UseDataStoreOptions | undefined
): UseDataStoreOptions =>
  typeof queryNameOrOptions === 'string'
    ? { queryName: queryNameOrOptions }
    : queryNameOrOptions !== undefined
    ? queryNameOrOptions
    : {
        queryName: '(unnamed)',
        quietHydrate: false,
      }

export default <TRecord>(
  getQuery:
    | null
    | ((
        client: SupabaseClient
      ) => GetQuery<TRecord> | Promise<GetQuery<TRecord>> | null),
  queryNameOrOptions?: string | UseDataStoreOptions
): [
  boolean,
  null | DataStoreErrorCode,
  null | TRecord[],
  null | number,
  () => void,
  boolean
] => {
  const client = useSupabaseClient()
  const [result, setResult] = useState<null | TRecord[]>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastErrorCode, setLastErrorCode] = useState<DataStoreErrorCode | null>(
    null
  )
  const [isHydrating, setIsHydrating] = useState(false)
  const [totalCount, setTotalCount] = useState<null | number>(null)
  const isUnmountedRef = useRef(false)
  const timerRef = useRef<number>(0)

  const {
    queryName: queryName,
    quietHydrate: isQuietHydrate,
    ...options
  } = getOptions(queryNameOrOptions)

  const hydrate = useCallback(async () => {
    try {
      if (!getQuery) {
        console.debug(`useDataStore :: ${queryName} :: no getQuery - skipping`)
        return
      }

      console.debug(`useDataStore :: ${queryName} :: running getQuery`)

      if (isQuietHydrate) {
        setIsHydrating(true)
        setIsLoading(false)
      } else {
        setIsLoading(true)
      }

      setLastErrorCode(null)
      timerRef.current = inDevelopment() ? performance.now() : 0

      const result = await getQuery(client)

      if (!result) {
        console.debug(
          `useDataStore :: ${queryName} :: getQuery returned non-query - skipping`
        )
        setIsLoading(false)
        return
      }

      const { error, data, count } = result

      console.debug(
        `useDataStore :: ${queryName} :: query complete`,
        error,
        data,
        count,
        inDevelopment() ? performance.now() - timerRef.current : 0
      )

      if (error) {
        // TODO: Do this in a generic way
        if (
          Array.isArray(options.uncatchErrorCodes) &&
          options.uncatchErrorCodes.includes(DataStoreErrorCode.BadRange) &&
          (error as PostgrestError).code === PostgresErrorCode.PGRST103
        ) {
          if (isQuietHydrate) {
            setIsHydrating(false)
          } else {
            setIsLoading(false)
          }

          setLastErrorCode(DataStoreErrorCode.BadRange)
          return
        } else {
          throw new Error(
            `useDataStore failed run query "${queryName}": ${error.code}: ${error.message} (${error.hint})`
          )
        }
      }

      if (isUnmountedRef.current) {
        console.debug(
          `Query complete but component has unmounted, skipping re-render...`
        )
        return
      }

      setResult(data)
      setTotalCount(count || null)

      if (isQuietHydrate) {
        setIsHydrating(false)
      } else {
        setIsLoading(false)
      }

      setLastErrorCode(null)
    } catch (err) {
      console.error(err)
      handleError(err)

      if (isUnmountedRef.current) {
        console.debug(
          `Query complete but component has unmounted, skipping re-render...`
        )
        return
      }

      if (isQuietHydrate) {
        setIsHydrating(false)
      }

      setLastErrorCode(getDataStoreErrorCodeFromError(err))
      setIsLoading(false)
    }
  }, [getQuery])

  useEffect(() => {
    // fix setting state on unmounted component
    isUnmountedRef.current = false

    hydrate()

    return () => {
      isUnmountedRef.current = true
    }
  }, [hydrate])

  return [isLoading, lastErrorCode, result, totalCount, hydrate, isHydrating]
}
