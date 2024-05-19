import { useEffect, useRef, useState, useCallback } from 'react'
// @ts-ignore
import { SupabaseQueryBuilder } from '@supabase/supabase-js'
import { handleError } from '../error-handling'
import { inDevelopment } from '../environment'

/**
 * TODO: Delete this hook and return to useDatabaseQuery as it abstracts Supabase
 */

export default <TResult>(
  getQuery:
    | null
    | (() => SupabaseQueryBuilder<any> | Promise<SupabaseQueryBuilder<any>>),
  queryName: string = 'unnamed',
  // TODO: Do this better/consistently - maybe an "options" object?
  isQuietHydrate: boolean = false
): [boolean, boolean, null | TResult, null | number, () => void, boolean] => {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isErrored, setIsErrored] = useState(false)
  const [isHydrating, setIsHydrating] = useState(false)
  const [totalCount, setTotalCount] = useState(null)
  const isUnmountedRef = useRef(false)
  const timerRef = useRef<number>(0)

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

      setIsErrored(false)
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
        throw new Error(
          `useDataStore failed run query "${queryName}": ${error.code}: ${error.message} (${error.hint})`
        )
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

      setIsErrored(false)
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

      // I thought React batched sets together but apparently not - set this first!
      setIsErrored(true)
      setIsLoading(false)
    }
  }, [getQuery, queryName])

  useEffect(() => {
    // fix setting state on unmounted component
    isUnmountedRef.current = false

    hydrate()

    return () => {
      isUnmountedRef.current = true
    }
  }, [hydrate])

  return [isLoading, isErrored, result, totalCount, hydrate, isHydrating]
}
