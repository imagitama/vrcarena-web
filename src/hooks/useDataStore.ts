import { useEffect, useRef, useState, useCallback } from 'react'
// @ts-ignore
import { SupabaseQueryBuilder } from '@supabase/supabase-js'
import { handleError } from '../error-handling'
import { inDevelopment } from '../environment'

/**
 * TODO: Decide if to delete this hook and return to useDatabaseQuery as it abstracts Supabase
 */

export enum ErrorCode {
  BadRange,
  Unknown,
}

enum PostgresErrorCode {
  // code: "PGRST103", details: "An offset of 200 was requested, but there are only 33 rows.", hint: null, message: "Requested range not satisfiable"
  PGRST103 = 'PGRST103',
}

export interface UseDataStoreOptions {
  name?: string
  quietHydrate?: boolean
  ignoreRangeErrors?: boolean // when user requests page that doesnt exist
}

const getOptions = (
  queryNameOrOptions: string | UseDataStoreOptions | undefined
): UseDataStoreOptions =>
  typeof queryNameOrOptions === 'string'
    ? { name: queryNameOrOptions }
    : queryNameOrOptions !== undefined
    ? queryNameOrOptions
    : {
        name: '(unnamed)',
        quietHydrate: false,
      }

interface PostgresError extends Error {
  code: string
}

const getErrorCodeFromError = (error: Error): ErrorCode => {
  if ((error as PostgresError).code) {
    switch ((error as PostgresError).code) {
      case PostgresErrorCode.PGRST103:
        return ErrorCode.BadRange
    }
  }
  return ErrorCode.Unknown
}

export default <TResult>(
  getQuery:
    | null
    | (() => SupabaseQueryBuilder<any> | Promise<SupabaseQueryBuilder<any>>),
  queryNameOrOptions?: string | UseDataStoreOptions
): [
  boolean,
  null | ErrorCode,
  null | TResult,
  null | number,
  () => void,
  boolean
] => {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastErrorCode, setLastErrorCode] = useState<ErrorCode | null>(null)
  const [isHydrating, setIsHydrating] = useState(false)
  const [totalCount, setTotalCount] = useState(null)
  const isUnmountedRef = useRef(false)
  const timerRef = useRef<number>(0)

  const {
    name: queryName,
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

      const { error, data, count } = await getQuery()

      console.debug(
        `useDataStore :: ${queryName} :: query complete`,
        error,
        data,
        count,
        inDevelopment() ? performance.now() - timerRef.current : 0
      )

      if (error) {
        if (
          options.ignoreRangeErrors &&
          (error as PostgresError).code === PostgresErrorCode.PGRST103
        ) {
          if (isQuietHydrate) {
            setIsHydrating(false)
          } else {
            setIsLoading(false)
          }

          setLastErrorCode(ErrorCode.BadRange)
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

      setLastErrorCode(getErrorCodeFromError(err as Error))
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
