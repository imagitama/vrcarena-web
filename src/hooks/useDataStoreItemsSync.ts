import { useEffect, useRef, useState } from 'react'
import { handleError } from '../error-handling'
import {
  DataStoreErrorCode,
  getDataStoreErrorCodeFromError,
} from '../data-store'
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
import useSupabaseClient from './useSupabaseClient'

/**
 * Subscribes to multiple documents in a collection.
 */
export default <TResult extends { [key: string]: any }>(
  collectionName: string,
  ids: string[] | false,
  queryName: string = 'unnamed',
  select: string = '*'
): [
  boolean,
  null | DataStoreErrorCode,
  null | { [id: string]: TResult } | false
] => {
  const [results, setResults] = useState<
    null | { [id: string]: TResult } | false
  >(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const isUnmountedRef = useRef(false)
  const channelRef = useRef<null | RealtimeChannel>(null)
  const supabase = useSupabaseClient()

  const doIt = async () => {
    try {
      if (!collectionName || !ids) {
        console.debug(
          `useDataStoreItemSync :: ${queryName} :: no collection name or ID - skipping`
        )
        return
      }

      const filter = ids.map((id) => `id=eq.${id}`).join(',')

      console.debug(
        `useDataStoreItemSync :: ${queryName} :: ${collectionName} :: running getQuery`,
        { collectionName, filter }
      )

      setIsLoading(true)
      setLastErrorCode(null)

      const onData = (payload: RealtimePostgresChangesPayload<TResult>) => {
        console.debug(`useDataStoreItemSync :: ${queryName} :: onData`, {
          payload,
        })

        const updatedRecord = payload.new

        setResults((currentResults) => {
          const newResults = { ...currentResults }
          newResults[(updatedRecord as any).id] = updatedRecord as TResult
          return newResults
        })
      }

      const channel = supabase
        .channel(collectionName)
        .on(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
          {
            event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL,
            schema: 'public',
            table: collectionName,
            filter,
          },
          onData
        )
        .subscribe((status, err) => {
          console.debug(
            `useDataStoreItemSync :: ${queryName} :: Status '${status}'`
          )
          if (err) {
            console.error(err)
            handleError(err)
            setLastErrorCode(DataStoreErrorCode.ChannelError)
          }
        })

      channelRef.current = channel

      if (isUnmountedRef.current) {
        console.debug(
          `useDataStoreItemSync :: Query complete but component has unmounted, skipping re-render...`
        )
        return
      }

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

      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [collectionName, ids ? ids.join('+') : false])

  return [isLoading, lastErrorCode, results]
}
