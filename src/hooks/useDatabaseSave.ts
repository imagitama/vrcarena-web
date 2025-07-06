import { useState } from 'react'
import { handleError } from '../error-handling'
import {
  DataStoreError,
  DataStoreErrorCode,
  DataStoreUpdateError,
  getDataStoreErrorCodeFromError,
} from '../data-store'
import useSupabaseClient from './useSupabaseClient'

type ClearFunc = () => void

export default <TRecord, TReturnVal = TRecord>(
  collectionName: string | false,
  documentId: string | null = null,
  isDelete: boolean = false,
  queryName?: string
): [
  boolean,
  boolean,
  null | DataStoreErrorCode,
  (fields?: Partial<TRecord>, id?: string) => Promise<(null | TReturnVal)[]>,
  ClearFunc
] => {
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const supabase = useSupabaseClient()

  const clear = () => {
    setIsSuccess(false)
    setLastErrorCode(null)
    setIsSaving(false)
  }

  const save = async (fields?: Partial<TRecord>, id?: string) => {
    // for amendments
    if (!collectionName) {
      return []
    }

    if (!isDelete) {
      if (!fields) {
        throw new Error('Need to pass fields')
      }

      // @ts-ignore
      if (fields.lastModifiedAt || fields.lastmodifiedat) {
        throw new Error('Never set the "lastModifiedAt" field when saving')
      }

      // @ts-ignore
      if (fields.lastModifiedBy || fields.lastmodifiedby) {
        throw new Error('Never set the "lastModifiedBy" field when saving')
      }

      // @ts-ignore
      if (fields.createdAt || fields.createdAt) {
        throw new Error('Never set the "createdAt" field when saving')
      }

      // @ts-ignore
      if (fields.createdBy || fields.createdBy) {
        throw new Error('Never set the "createdBy" field when saving')
      }
    }

    const idToSave = id || documentId

    setIsSuccess(false)
    setLastErrorCode(null)
    setIsSaving(true)

    try {
      console.debug('useDatabaseSave', {
        queryName,
        collectionName,
        idToSave,
        fields,
      })

      let returnData: null | TReturnVal

      if (idToSave) {
        if (isDelete) {
          console.debug(`deleting ${idToSave}...`)

          const { error } = await supabase
            .from(collectionName)
            .delete()
            .eq('id', idToSave)

          if ((Array.isArray(error) && error.length > 0) || error) {
            console.error(error)
            throw new Error(`Failed to delete docs`)
          }
        } else {
          if (!fields) {
            throw new Error('Need to pass fields')
          }

          const { data, error } = await supabase
            .from(collectionName)
            .update(fields)
            .eq('id', idToSave)
            .select()

          console.debug(`useDatabaseSave update result`, { data, error })

          if ((Array.isArray(error) && error.length > 0) || error) {
            if (Array.isArray(error)) {
              throw new DataStoreError('Failed to update record', error[0])
            } else {
              throw new DataStoreError('Failed to update record', error)
            }
          }

          if (data.length === 0) {
            throw new DataStoreUpdateError(
              `Result was length of 0 - probably RLS issue`
            )
          }
        }

        returnData = null
      } else {
        if (!fields) {
          throw new Error('Need to pass fields')
        }

        const { data, error, ...other } = await supabase
          .from(collectionName)
          .insert(fields)
          .select()

        console.debug(`useDatabaseSave insert result`, { data, error, other })

        if ((Array.isArray(error) && error.length > 0) || error) {
          console.error(error)
          throw new DataStoreError(`Failed to insert doc`, error)
        }

        if (!data || !data.length || data.length === 0) {
          console.debug(data)
          throw new Error(`Unexpected result from insert`)
        }

        returnData = data[0]
      }

      setIsSuccess(true)
      setLastErrorCode(null)
      setIsSaving(false)

      return [returnData]
    } catch (err) {
      console.error('Failed to save document', err)
      handleError(err)
      setIsSuccess(false)
      setLastErrorCode(getDataStoreErrorCodeFromError(err))
      setIsSaving(false)
      return []
    }
  }

  return [isSaving, isSuccess, lastErrorCode, save, clear]
}
