import { useState } from 'react'
import { handleError } from '@/error-handling'
import { mapFieldsForDatabase } from '@/utils'
import {
  DataStoreError,
  DataStoreErrorCode,
  DataStoreOptions,
  getDataStoreErrorCodeFromError,
} from '@/data-store'
import useSupabaseClient from './useSupabaseClient'

type ClearFn = () => void

/**
 * Edits an existing record or creates a new one.
 * A light wrapper around supabase .upsert()
 *
 * If you dont specify an ID column it is assumed it is 'id'
 */
const useDataStoreEditOrCreate = <TRecord extends Record<string, unknown>>(
  collectionName: string,
  id: string | false,
  options: DataStoreOptions = {
    ignoreErrorCodes: [],
  }
): [
  boolean,
  boolean,
  null | DataStoreErrorCode,
  (fields: Partial<TRecord>) => Promise<TRecord | undefined>,
  ClearFn,
  null | TRecord
] => {
  if (!collectionName) {
    throw new Error('Cannot edit/create: no collection name provided')
  }

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [updatedRecord, setUpdatedRecord] = useState<null | TRecord>(null)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const supabase = useSupabaseClient()

  const clear = () => {
    setIsSuccess(false)
    setLastErrorCode(null)
    setIsEditing(false)
  }

  const save = async (
    fields: Partial<TRecord>
  ): Promise<TRecord | undefined> => {
    try {
      const fieldsForUpdate = mapFieldsForDatabase(fields) as TRecord

      const idFieldName = Array.isArray(options.idField)
        ? options.idField[0]
        : options.idField
        ? options.idField
        : 'id'
      // @ts-ignore investigate
      fieldsForUpdate[idFieldName] = id

      console.debug(
        `useDataStoreEditOrCreate :: ${options.queryName || '(unnamed)'} :: ${
          id ? 'update' : 'create'
        } ${collectionName} ${id ? id : ''}...`,
        fieldsForUpdate
      )

      setIsSuccess(false)
      setLastErrorCode(null)
      setIsEditing(true)

      const { data, error } = id
        ? await supabase
            .from(collectionName)
            .update<TRecord>(fieldsForUpdate)
            .eq('id', id)
            .select('*')
        : await supabase
            .from(collectionName)
            .insert<TRecord>(fieldsForUpdate)
            .select('*')
      // const { data, error } = await supabase
      //   .from(collectionName)
      //   .upsert<TRecord>(fieldsForUpdate, {
      //     onConflict: options.uniqueConstraintFields?.join(','),
      //   })
      //   .select('*')

      if (error) {
        console.error(error)
        throw new DataStoreError('useDataStoreEditOrCreate failed', error)
      }

      if (data.length !== 1) {
        throw new Error(`Count is ${data.length}`)
      }

      console.debug(
        `useDataStoreEditOrCreate :: ${
          options.queryName || '(unnamed)'
        } :: ${collectionName} :: success`
      )

      setIsEditing(false)
      setIsSuccess(true)
      setLastErrorCode(null)
      setUpdatedRecord(data[0])

      return data[0]
    } catch (err) {
      setIsEditing(false)
      setIsSuccess(false)

      const errorCode = getDataStoreErrorCodeFromError(err as Error)

      if (
        options.ignoreErrorCodes &&
        options.ignoreErrorCodes.includes(errorCode)
      ) {
        // @ts-ignore
        return
      }

      if (
        !(
          options.unstoreErrorCodes &&
          options.unstoreErrorCodes.includes(errorCode)
        )
      ) {
        setLastErrorCode(errorCode)
      }

      if (
        !(
          options.uncatchErrorCodes &&
          options.uncatchErrorCodes.includes(errorCode)
        )
      ) {
        console.error('Failed to save document', err)
        handleError(err)
      }
    }
  }

  return [isEditing, isSuccess, lastErrorCode, save, clear, updatedRecord]
}

export default useDataStoreEditOrCreate
