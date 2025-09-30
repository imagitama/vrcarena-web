import { useEffect, useRef, useState } from 'react'
import { handleError } from '../error-handling'
import {
  DataStoreError,
  DataStoreErrorCode,
  DataStoreOptions,
  getDataStoreErrorCodeFromError,
} from '../data-store'
import useSupabaseClient from './useSupabaseClient'

type HydrateFn = () => Promise<void>

/**
 * Uses a single item inside the data store.
 * Returns if loading, if errored and the result of the last query (null = waiting, record or false = NO record).
 */
export default <TResult extends Record<string, unknown>>(
  collectionName: string,
  id: string | false,
  options: DataStoreOptions = {
    idField: 'id',
    queryName: 'unnamed',
    select: 'id, *',
  }
): [boolean, null | DataStoreErrorCode, null | TResult | false, HydrateFn] => {
  const [result, setResult] = useState<null | TResult | false>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const isUnmountedRef = useRef(false)
  const supabase = useSupabaseClient()
  const lastIdRef = useRef<string | false>(id)

  const doIt = async () => {
    try {
      if (!collectionName || !id) {
        if (lastIdRef.current !== id) {
          console.debug(
            `useDataStoreItem :: ${
              options.queryName || 'unnamed'
            } :: ID changed to nothing - resetting`
          )
          setResult(null)
          lastIdRef.current = id
          return
        }

        console.debug(
          `useDataStoreItem :: ${
            options.queryName || 'unnamed'
          } :: no collection name or ID - skipping`
        )
        return
      }

      console.debug(
        `useDataStoreItem :: ${
          options.queryName || 'unnamed'
        } :: running getQuery`
      )

      lastIdRef.current = id

      setIsLoading(true)
      setLastErrorCode(null)

      const { error, data } = await supabase
        .from(collectionName.toLowerCase())
        .select<any, TResult>(options.select || `${options.idField || 'id'}, *`)
        // TODO: Check if array
        .eq((options.idField as string) || 'id', id)

      console.debug(
        `useDataStoreItem :: ${
          options.queryName || 'unnamed'
        } :: query complete`,
        error,
        data
      )

      if (error) {
        throw new DataStoreError(
          `useDataStoreItem failed run query "${
            options.queryName || 'unnamed'
          }"`,
          error
        )
      }

      if (data && data.length !== 1) {
        setResult(false)
        setIsLoading(false)
        setLastErrorCode(null)
        return
      }

      if (isUnmountedRef.current) {
        console.debug(
          `Query ${
            options.queryName || 'unnamed'
          } complete but component has unmounted, skipping re-render...`
        )
        return
      }

      setResult(data[0])
      setIsLoading(false)
      setLastErrorCode(null)
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsLoading(false)
      setLastErrorCode(getDataStoreErrorCodeFromError(err))
    }
  }

  useEffect(() => {
    // fix setting state on unmounted component
    isUnmountedRef.current = false

    doIt()

    return () => {
      isUnmountedRef.current = true
    }
  }, [collectionName, id])

  const hydrate = () => doIt()

  return [isLoading, lastErrorCode, result, hydrate]
}
