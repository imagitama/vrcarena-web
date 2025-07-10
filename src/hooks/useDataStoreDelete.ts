import { useState } from 'react'
import { handleError } from '../error-handling'
import {
  DataStoreError,
  DataStoreErrorCode,
  DataStoreOptions,
  getDataStoreErrorCodeFromError,
} from '../data-store'
import useSupabaseClient from './useSupabaseClient'

const useDataStoreDelete = (
  collectionName: string,
  id: string | false,
  options: DataStoreOptions = {
    ignoreErrorCodes: [],
  }
): [
  boolean,
  boolean,
  null | DataStoreErrorCode,
  () => Promise<void>,
  () => void
] => {
  if (!collectionName) {
    throw new Error('Cannot edit: no collection name provided')
  }

  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const supabase = useSupabaseClient()

  const clear = () => {
    setIsSuccess(false)
    setLastErrorCode(null)
    setIsDeleting(false)
  }

  const performDelete = async () => {
    try {
      if (!id) {
        return
      }

      console.debug(
        `useDataStoreDelete :: ${
          options?.queryName || '(unknown)'
        } :: ${collectionName} :: ${id} :: delete`
      )

      setIsSuccess(false)
      setLastErrorCode(null)
      setIsDeleting(true)

      const { error } = await supabase
        .from(collectionName)
        .delete()
        .eq('id', id)

      if (error) {
        console.error(error)
        throw new DataStoreError('useDataStoreDelete failed', error)
      }

      console.debug(
        `useDataStoreDelete :: ${
          options?.queryName || '(unknown)'
        } :: ${collectionName} :: ${id} :: delete success`
      )

      setIsDeleting(false)
      setIsSuccess(true)
      setLastErrorCode(null)
    } catch (err) {
      setIsDeleting(false)
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
        console.error('Failed to delete document', err)
        handleError(err)
      }
    }
  }

  return [isDeleting, isSuccess, lastErrorCode, performDelete, clear]
}

export default useDataStoreDelete
