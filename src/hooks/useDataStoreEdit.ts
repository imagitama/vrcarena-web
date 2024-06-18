import { useState } from 'react'
import { handleError } from '../error-handling'
import { client as supabase } from '../supabase'
import { mapFieldsForDatabase } from '../utils'
import {
  CommonRecordFields,
  DataStoreError,
  DataStoreErrorCode,
  DataStoreOptions,
  getDataStoreErrorCodeFromError,
} from '../data-store'

const useDataStoreEdit = <TRecord>(
  collectionName: string,
  id: string | false,
  options: DataStoreOptions = {
    ignoreErrorCodes: [],
  }
): [
  boolean,
  boolean,
  null | DataStoreErrorCode,
  (fields: Partial<TRecord>) => Promise<void>,
  () => void
] => {
  if (!collectionName) {
    throw new Error('Cannot edit: no collection name provided')
  }

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )

  const clear = () => {
    setIsSuccess(false)
    setLastErrorCode(null)
    setIsEditing(false)
  }

  const save = async (fields: Partial<TRecord>) => {
    try {
      if (!id) {
        return
      }

      setIsSuccess(false)
      setLastErrorCode(null)
      setIsEditing(true)

      // @ts-ignore
      if (fields.id) {
        throw new Error(`Cannot provide an id property when performing update`)
      }

      const fieldsForUpdate = mapFieldsForDatabase(fields) as TRecord

      const { error } = await supabase
        .from<TRecord & CommonRecordFields>(collectionName)
        .update(fieldsForUpdate, {
          returning: 'representation',
        })
        // @ts-ignore
        .eq('id', id)

      if (error) {
        console.error(error)
        throw new DataStoreError('useDataStoreEdit failed', error)
      }

      setIsEditing(false)
      setIsSuccess(true)
      setLastErrorCode(null)
    } catch (err) {
      setIsEditing(false)
      setIsSuccess(false)

      const errorCode = getDataStoreErrorCodeFromError(err as Error)

      if (
        options.ignoreErrorCodes &&
        options.ignoreErrorCodes.includes(errorCode)
      ) {
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

  return [isEditing, isSuccess, lastErrorCode, save, clear]
}

export default useDataStoreEdit
