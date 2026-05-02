import { useEffect, useRef, useState } from 'react'
import { handleError } from '@/error-handling'
import {
  DataStoreErrorCode,
  getDataStoreErrorCodeFromError,
} from '@/data-store'
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  RealtimeChannel,
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
} from '@supabase/supabase-js'
import useSupabaseClient from './useSupabaseClient'
import { QueryOptions as BaseQueryOptions } from './useDataStoreItems'

interface QueryOptions<TItem> extends BaseQueryOptions<TItem> {
  // WARNING: replaces setState for performance
  onRecordReplacement?: (newRecord: TItem) => void
  // onDeleteReplacement?: (deletedRecord: DeletedRecord) => void
}

interface DeletedRecord {
  id: string // assumes PK is "id"
}

/**
 * Subscribes to all INSERTs and DELETEs in a collection.
 */
export default <TItem extends Record<string, any>>(
  collectionName: string,
  options: QueryOptions<TItem> = {
    queryName: '',
  }
): [boolean, null | DataStoreErrorCode, TItem[] | null] => {
  const [createdRecords, setCreatedRecords] = useState<null | TItem[]>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const isUnmountedRef = useRef(false)
  const channelRef = useRef<null | RealtimeChannel>(null)
  const supabase = useSupabaseClient()

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

      setIsLoading(true)
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

        if (options.onRecordReplacement) {
          options.onRecordReplacement(createdRecord)
        } else {
          setCreatedRecords((currentItems) =>
            currentItems === null
              ? [createdRecord]
              : currentItems.concat([createdRecord])
          )
        }
      }

      // TODO: finish this sometime
      // the issue is after a bulk delete (like clearing a whiteboard pen) it sends an event per record so spams us
      // for now other users need to refresh the entire component
      // const onDelete = (payload: RealtimePostgresDeletePayload<TItem>) => {
      //   console.debug(
      //     `useDataStoreItemsSync :: ${options.queryName} :: ${collectionName} :: onDelete`,
      //     {
      //       payload,
      //     }
      //   )

      //   if (isUnmountedRef.current) {
      //     return
      //   }

      //   const deletedRecord = payload.old as unknown as DeletedRecord // DELETE only provides PK

      //   if (options.onDeleteReplacement) {
      //     options.onDeleteReplacement(deletedRecord)
      //   } else {
      //     // TODO
      //   }
      // }

      const channel = supabase
        .channel(`${collectionName}`)
        .on(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
          {
            event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT,
            schema: 'public',
            table: collectionName,
            // filter,
          },
          onInsert
        )
        //  .on(
        //   REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        //   {
        //     event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE,
        //     schema: 'public',
        //     table: collectionName,
        //     // filter,
        //   },
        //   onDelete
        // )
        .subscribe((status, err) => {
          console.debug(
            `useDataStoreItemsSync :: ${options.queryName} :: ${collectionName} :: Status '${status}'`
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
          `useDataStoreItemsSync :: ${options.queryName} :: ${collectionName} :: Query complete but component has unmounted, skipping re-render...`
        )
        return
      }

      setCreatedRecords([]) // initialize with empty array to signal we are ready
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
  }, [collectionName])

  return [isLoading, lastErrorCode, createdRecords]
}
