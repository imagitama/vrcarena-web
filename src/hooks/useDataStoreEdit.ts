import { useState } from 'react'
import { handleError } from '../error-handling'
import { mapFieldsForDatabase } from '../utils'
import {
  DataStoreError,
  DataStoreErrorCode,
  DataStoreOptions,
  getDataStoreErrorCodeFromError,
} from '../data-store'
import useSupabaseClient from './useSupabaseClient'

type ClearFn = () => void

const useDataStoreEdit = <TRecord extends Record<string, unknown>>(
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

      if (fields.id) {
        console.warn(`property "id" found in fields - removing as unnecessary`)
        delete fields.id
      }

      const fieldsForUpdate = mapFieldsForDatabase(fields) as TRecord

      console.debug(
        `useDataStoreEdit :: ${
          options.queryName || '(unnamed)'
        } :: update ${collectionName} ${id}...`,
        fieldsForUpdate
      )

      setIsSuccess(false)
      setLastErrorCode(null)
      setIsEditing(true)

      const { data, error } = await supabase
        .from(collectionName)
        .update<TRecord>(fieldsForUpdate)
        .eq('id', id)
        .select<'*', TRecord>('*')

      if (error) {
        console.error(error)
        throw new DataStoreError('useDataStoreEdit failed', error)
      }

      if (data.length !== 1) {
        throw new Error(`Count is ${data.length}`)
      }

      console.debug(
        `useDataStoreEdit :: ${
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

export default useDataStoreEdit
