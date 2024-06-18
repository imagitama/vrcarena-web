import { useEffect, useRef, useState } from 'react'
import { client as supabase } from '../supabase'
import { handleError } from '../error-handling'
import {
  DataStoreError,
  DataStoreErrorCode,
  getDataStoreErrorCodeFromError,
} from '../data-store'

type HydrateFunction = () => void

/**
 * Uses a single item inside the data store.
 * Returns if loading, if errored and the result of the last query (null = waiting, record or false = NO record).
 */
export default <TResult>(
  collectionName: string,
  id: string | false,
  queryName: string = 'unnamed',
  select: string = '*'
): [
  boolean,
  null | DataStoreErrorCode,
  null | TResult | false,
  HydrateFunction
] => {
  const [result, setResult] = useState<null | TResult | false>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const isUnmountedRef = useRef(false)

  const doIt = async () => {
    try {
      if (!collectionName || !id) {
        console.debug(
          `useDataStoreItem :: ${queryName} :: no collection name or ID - skipping`
        )
        return
      }

      console.debug(`useDataStoreItem :: ${queryName} :: running getQuery`)

      setIsLoading(true)
      setLastErrorCode(null)

      const { error, data } = await supabase
        .from(collectionName.toLowerCase())
        .select(`id, ${select}`)
        .eq('id', id)

      console.debug(
        `useDataStoreItem :: ${queryName} :: query complete`,
        error,
        data
      )

      if (error) {
        throw new DataStoreError(
          `useDataStoreItem failed run query "${queryName}"`,
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
          `Query complete but component has unmounted, skipping re-render...`
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
