import { useEffect, useRef, useState } from 'react'
import { handleError } from '@/error-handling'
import {
  DataStoreErrorCode,
  getDataStoreErrorCodeFromError,
} from '@/data-store'
import useSupabaseClient from './useSupabaseClient'

export interface QueryOptions<TItem> {
  queryName?: string
  orderBy?: keyof TItem
  quietHydrate?: boolean
  limit?: number
}

export type HydrateFn = () => Promise<void>

export default <TItem>(
  collectionName: string,
  ids?: string[] | undefined | false,
  options: QueryOptions<TItem> = {
    queryName: '',
  }
): [
  boolean,
  null | DataStoreErrorCode,
  TItem[] | null,
  number | null,
  HydrateFn
] => {
  const [result, setResult] = useState<TItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const hasInitialResultsRef = useRef(false)
  const supabase = useSupabaseClient()
  const hasUnmountedRef = useRef(false)

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

      let allData: TItem[] = []
      let page = 0
      const pageSize = 1000

      while (true) {
        let query = supabase
          .from(collectionName)
          .select('*', { count: 'exact' })

        if (ids !== undefined) {
          query = query.or(ids.map((id) => `id.eq.${id}`).join(','))
        }

        // TODO: change to array like useDatabaseQuery
        if (options.orderBy) {
          query = query.order(options.orderBy as string, { ascending: true })
        }

        const from = page * pageSize
        const to = from + pageSize - 1
        query = query.range(
          from,
          options.limit ? Math.min(to, options.limit - 1) : to
        )

        const { error, data } = await query

        if (error) {
          if (error.code === 'PGRST103') break // offset exceeds row count, we're done
          throw error
        }

        if (!data || data.length === 0) break

        allData = allData.concat(data)

        const reachedLimit = options.limit && allData.length >= options.limit
        if (reachedLimit || data.length < pageSize) break

        page++
      }

      const data = allData
      const count = allData.length

      console.debug(
        `useDataStoreItems :: ${collectionName} :: ${options.queryName} :: query complete`,
        { ids },
        // error,
        data,
        count
      )

      // if (error) {
      //   throw new Error(
      //     `useDataStoreItems failed run query for collection "${collectionName}" query "${options.queryName}": ${error.code}: ${error.message} (${error.hint})`
      //   )
      // }

      if (hasUnmountedRef.current) {
        return
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

      if (hasUnmountedRef.current) {
        return
      }

      setLastErrorCode(getDataStoreErrorCodeFromError(err))
      setIsLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      hasUnmountedRef.current = true
    }
  }, [])

  useEffect(() => {
    hydrate()
  }, [
    collectionName,
    Array.isArray(ids) ? ids.join(',') : ids,
    options.orderBy,
  ])

  return [isLoading, lastErrorCode, result, totalCount, hydrate]
}
