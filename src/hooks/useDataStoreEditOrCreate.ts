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
 * Wrapper around Supabase .upsert()
 * Does NOT perform a .select() after (is a TODO)
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
  (fields: Partial<TRecord>) => Promise<TRecord>,
  ClearFn,
  null | TRecord
] => {
  if (!collectionName) {
    throw new Error('Cannot edit: no collection name provided')
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

  // @ts-ignore
  const save = async (fields: Partial<TRecord>): Promise<TRecord> => {
    try {
      if (!id) {
        // @ts-ignore
        return
      }

      const fieldsForUpdate = mapFieldsForDatabase(fields) as TRecord

      const idFieldName = Array.isArray(options.idField)
        ? options.idField[0]
        : options.idField
        ? options.idField
        : 'id'
      // @ts-ignore investigate
      fieldsForUpdate[idFieldName] = id

      console.debug(
        `useDataStoreEditOrCreate :: ${
          options.queryName || '(unnamed)'
        } :: update ${collectionName} ${id}...`,
        fieldsForUpdate
      )

      setIsSuccess(false)
      setLastErrorCode(null)
      setIsEditing(true)

      // let query = supabase.from(collectionName).update<TRecord>(fieldsForUpdate)

      // if (Array.isArray(options.idField)) {
      //   console.debug(`is array of ID fields`, options.idField)
      //   for (const idField of options.idField) {
      //     query = query.eq(idField, fields[idField])
      //   }
      // } else {
      //   query = query.eq(options.idField || 'id', id)
      // }

      const createResult = await supabase
        .from(collectionName)
        .upsert<TRecord>(fieldsForUpdate)

      // TODO: finish
      // if (selectAfter) {
      //   .select<string, TRecord>(options.select || '*')
      // }

      if (createResult.error) {
        console.error(createResult.error)

        throw new DataStoreError(
          'useDataStoreEditOrCreate create failed',
          createResult.error
        )
      }

      // if (!createResult.data || !createResult.data.length) {
      //   throw new DataStoreError(
      //     'useDataStoreEditOrCreate data null or invalid length'
      //   )
      // }

      // data = createResult.data

      console.debug(
        `useDataStoreEditOrCreate :: ${
          options.queryName || '(unnamed)'
        } :: ${collectionName} :: success`
      )

      setIsEditing(false)
      setIsSuccess(true)
      setLastErrorCode(null)
      // setUpdatedRecord(data[0])

      // return data[0]
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
