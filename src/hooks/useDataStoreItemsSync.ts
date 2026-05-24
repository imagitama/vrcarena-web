import { useEffect, useRef, useState } from 'react'
import { handleError } from '@/error-handling'
import {
  DataStoreErrorCode,
  getDataStoreErrorCodeFromError,
} from '@/data-store'
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  REALTIME_SUBSCRIBE_STATES,
  RealtimeChannel,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from '@supabase/supabase-js'
import useSupabaseClient from './useSupabaseClient'
import { QueryOptions as BaseQueryOptions } from './useDataStoreItems'
import { refreshJwtParallel } from '@/supabase'

interface QueryOptions<TItem> extends BaseQueryOptions<TItem> {
  // WARNING: replaces setState for performance
  onInsertInstead?: (insertedRecord: TItem) => void
  onUpdateInstead?: (updatedRecord: TItem) => void
  filter?: (record: TItem) => boolean
}

type ClearFn = () => void

/**
 * Subscribes to all INSERTs and UPDATEs in a collection.
 */
export default <TItem extends Record<string, any>>(
  collectionName: string,
  options: QueryOptions<TItem> = {
    queryName: '',
  }
): [boolean, boolean, null | DataStoreErrorCode, TItem[] | null, ClearFn] => {
  const [records, setRecords] = useState<null | TItem[]>(null)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const isUnmountedRef = useRef(false)
  const channelRef = useRef<null | RealtimeChannel>(null)
  const supabase = useSupabaseClient()

  // supabase realtime doesn't emit any signals for JWT expiry so we have to catch their uncaught error
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      if (typeof event.reason === 'string' && event.reason.includes('InvalidJWTToken')) {
        console.error(event)
        event.preventDefault();

        (async () => {
          try {
            console.debug(`JWT invalid/expired, refreshing and re-subscribing...`)

            await refreshJwtParallel()
            await doIt()

            console.debug(`JWT refresh and re-subscribe done`)
          } catch (err) {
            console.error(err)
            handleError(err)
          }
        })()
      }
    }

    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])

  const doIt = async () => {
    try {
      if (!collectionName) {
        console.debug(
          `useDataStoreItemsSync :: ${options.queryName} :: no collection name - skipping`
        )
        return
      }

      console.debug(
        `useDataStoreItemsSync :: ${options.queryName} :: ${collectionName} :: running`,
        { collectionName }
      )

      setIsSubscribing(true)
      setLastErrorCode(null)

      const onInsert = (payload: RealtimePostgresInsertPayload<TItem>) => {
        console.debug(
          `useDataStoreItemsSync :: ${options.queryName} :: ${collectionName} :: onInsert`,
          {
            payload,
          }
        )

        if (isUnmountedRef.current) {
          return
        }

        const createdRecord = payload.new as TItem

        if (options.filter && !options.filter(createdRecord)) {
          return
        }

        if (options.onInsertInstead) {
          options.onInsertInstead(createdRecord)
        } else {
          setRecords((currentItems) =>
            currentItems === null
              ? [createdRecord]
              : currentItems.concat([createdRecord])
          )
        }
      }

      const onUpdate = (payload: RealtimePostgresUpdatePayload<TItem>) => {
        console.debug(
          `useDataStoreItemsSync :: ${options.queryName} :: ${collectionName} :: onUpdate`,
          {
            payload,
          }
        )

        if (isUnmountedRef.current) {
          return
        }

        const updatedRecord = payload.new as TItem

        if (options.filter && !options.filter(updatedRecord)) {
          return
        }

        if (options.onUpdateInstead) {
          options.onUpdateInstead(updatedRecord)
        } else {
          setRecords((currentItems) => {
            if (currentItems === null) return [updatedRecord];
            const exists = currentItems.some((item) => item.id === updatedRecord.id);
            return exists
              ? currentItems.map((item) => item.id === updatedRecord.id ? updatedRecord : item)
              : [...currentItems, updatedRecord];
          })
        }
      }

      const channel = supabase
        .channel(`${collectionName}`)
        .on(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
          {
            event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT,
            schema: 'public',
            table: collectionName,
            // filter
          },
          onInsert
        )
        .on(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
          {
            event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
            schema: 'public',
            table: collectionName,
            // filter
          },
          onUpdate
        )
        .subscribe((status, err) => {
          console.debug(
            `useDataStoreItemsSync :: ${options.queryName} :: Status '${status}'${err ? ` :: Error '${err.message}'` : ''}`
          )

          if (err) {
            console.error(err)
            handleError(err)
          }

          switch (status) {
            case REALTIME_SUBSCRIBE_STATES.SUBSCRIBED:
              setIsSubscribed(true)
              break

            case REALTIME_SUBSCRIBE_STATES.CLOSED:
              setIsSubscribed(false)
              break

            case REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR:
            case REALTIME_SUBSCRIBE_STATES.TIMED_OUT:
              if (err?.message?.includes('InvalidJWTToken')) {
                (async () => {
                  try {
                    console.debug(`JWT expired, refreshing and re-subscribing...`)

                    await refreshJwtParallel()
                    await doIt()

                    console.debug(`JWT refresh and re-subscribe done`)
                  } catch (err) {
                    console.error(err)
                    handleError(err)
                  }
                })()
                return
              }

              setLastErrorCode(DataStoreErrorCode.ChannelError)
              setIsSubscribed(false)
              break

            default:
              console.warn(`Unknown status "${status}"`)
          }
        })

      channelRef.current = channel

      if (isUnmountedRef.current) {
        console.debug(
          `useDataStoreItemsSync :: ${options.queryName} :: ${collectionName} :: Query complete but component has unmounted, skipping re-render...`
        )
        return
      }

      setRecords([]) // initialize with empty array to signal we are ready
      setIsSubscribing(false)
      setLastErrorCode(null)
    } catch (err) {
      console.error(`Failed to do it:`, err)
      handleError(err)
      setIsSubscribing(false)
      setIsSubscribed(false)
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
  }, [collectionName])

  const clearFn = () => setRecords(null)

  return [isSubscribing, isSubscribed, lastErrorCode, records, clearFn]
}
