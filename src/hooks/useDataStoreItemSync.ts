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
 * Subscribes to a documents in a collection.
 */
export default <TResult extends { [key: string]: any }>(
  collectionName: string,
  id: string,
  queryName: string = 'unnamed',
  select: string = '*'
): [boolean, null | DataStoreErrorCode, null | TResult | false] => {
  const [result, setResult] = useState<null | TResult | false>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const isUnmountedRef = useRef(false)
  const channelRef = useRef<null | RealtimeChannel>(null)
  const supabase = useSupabaseClient()

  const doIt = async () => {
    try {
      if (!collectionName || !id) {
        console.debug(
          `useDataStoreItemSync :: ${queryName} :: no collection name or ID - skipping`
        )
        return
      }

      const filter = `id=eq.${id}`

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

        if (isUnmountedRef.current) {
          return
        }

        if (
          payload.eventType === REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE
        ) {
          setResult(null)
          return
        }

        const updatedRecord = payload.new as TResult

        setResult(updatedRecord)
      }

      const channel = supabase
        .channel(`${collectionName}_${id}`)
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
  }, [collectionName, id])

  return [isLoading, lastErrorCode, result]
}
