import { useState } from 'react'
import { handleError } from '../error-handling'
import { client as supabase } from '../supabase'
import { mapFieldsForDatabase } from '../utils'
import { DataStoreError } from '../data-store'

interface CommonRecordFields {
  id: string
}

export default <TRecord>(
  collectionName: string,
  id: string | false
): [
  boolean,
  boolean,
  null | DataStoreError,
  (fields: Partial<TRecord>) => Promise<void>,
  () => void
] => {
  if (!collectionName) {
    throw new Error('Cannot edit: no collection name provided')
  }

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [lastError, setLastError] = useState<null | DataStoreError>(null)

  const clear = () => {
    setIsSuccess(false)
    setLastError(null)
    setIsEditing(false)
  }

  const save = async (fields: Partial<TRecord>) => {
    try {
      if (!id) {
        return
      }

      setIsSuccess(false)
      setLastError(null)
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
      setLastError(null)
    } catch (err) {
      setIsEditing(false)
      setIsSuccess(false)
      setLastError(err as DataStoreError)

      console.error('Failed to save document', err)
      handleError(err)
    }
  }

  return [isEditing, isSuccess, lastError, save, clear]
}
