import { useEffect, useRef, useState } from 'react'
import { handleError } from '../error-handling'
import {
  DataStoreErrorCode,
  getDataStoreErrorCodeFromError,
} from '../data-store'
import useSupabaseClient from './useSupabaseClient'

interface QueryOptions<TItem> {
  queryName?: string
  orderBy?: keyof TItem
  quietHydrate?: boolean
}

export default <TItem>(
  collectionName: string,
  ids: string[] | undefined | false,
  options: QueryOptions<TItem> = {
    queryName: '',
  }
): [
  boolean,
  null | DataStoreErrorCode,
  TItem[] | null,
  number | null,
  () => void
] => {
  const [result, setResult] = useState<TItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const hasInitialResultsRef = useRef(false)
  const supabase = useSupabaseClient()

  const hydrate = async () => {
    try {
      if (!collectionName) {
        console.debug(
          `useDataStoreItems :: ${options.queryName} :: no collection name - skipping`
        )
        return
      }

      if (ids === false) {
        console.debug(
          `useDataStoreItems :: ${options.queryName} :: IDs false - skipping`
        )
        return
      }

      console.debug(
        `useDataStoreItems :: ${collectionName} :: ${options.queryName} :: running getQuery`,
        { ids }
      )

      if (
        options.quietHydrate !== true ||
        (options.quietHydrate === true &&
          hasInitialResultsRef.current === false)
      ) {
        setIsLoading(true)
      }
      setLastErrorCode(null)

      let query = supabase.from(collectionName).select('*')

      if (ids !== undefined) {
        query = query.or(ids.map((id) => `id.eq.${id}`).join(','))
      }

      // TODO: Do this better
      if (options.orderBy) {
        query = query.order(options.orderBy as string, { ascending: true })
      }

      const { error, data, count } = await query

      console.debug(
        `useDataStoreItems :: ${collectionName} :: ${options.queryName} :: query complete`,
        { ids },
        error,
        data,
        count
      )

      if (error) {
        throw new Error(
          `useDataStoreItems failed run query for collection "${collectionName}" query "${options.queryName}": ${error.code}: ${error.message} (${error.hint})`
        )
      }

      setResult(data as TItem[])
      setTotalCount(count || null)

      if (
        options.quietHydrate !== true ||
        (options.quietHydrate === true &&
          hasInitialResultsRef.current === false)
      ) {
        setIsLoading(false)
      }

      setLastErrorCode(null)

      hasInitialResultsRef.current = true
    } catch (err) {
      console.error(err)
      handleError(err)
      setLastErrorCode(getDataStoreErrorCodeFromError(err))
      setIsLoading(false)
    }
  }

  useEffect(() => {
    hydrate()
  }, [
    collectionName,
    Array.isArray(ids) ? ids.join(',') : ids,
    options.orderBy,
  ])

  return [isLoading, lastErrorCode, result, totalCount, hydrate]
}
