import { useState } from 'react'
import { handleError } from '../error-handling'
import {
  DataStoreErrorCode,
  getDataStoreErrorCodeFromError,
} from '../data-store'
import useSupabaseClient from './useSupabaseClient'

const useDataStoreCreateBulk = <TRecord extends Record<string, unknown>>(
  collectionName: string,
  options?: {
    queryName?: string
  }
): [
  boolean,
  boolean,
  DataStoreErrorCode | null,
  (fields: Partial<TRecord>[]) => Promise<TRecord[]>,
  () => void,
  TRecord[] | null
] => {
  if (!collectionName) {
    throw new Error('Cannot create: no collection name provided')
  }

  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const [createdDocs, setCreatedDocs] = useState<null | TRecord[]>(null)
  const supabase = useSupabaseClient()

  const clear = () => {
    setIsSuccess(false)
    setLastErrorCode(null)
    setIsCreating(false)
    setCreatedDocs(null)
  }

  const create = async (fields: Partial<TRecord>[]): Promise<TRecord[]> => {
    try {
      console.debug(
        `useDataStoreCreateBulk :: Query ${
          options?.queryName || '(unnamed)'
        } start`
      )

      setIsSuccess(false)
      setLastErrorCode(null)
      setIsCreating(true)

      if ((fields as any).id) {
        throw new Error(`Cannot provide an id when performing create`)
      }

      const { data, error } = await supabase
        .from<any, { Insert: TRecord }>(collectionName)
        .insert(fields as TRecord[])
        .select<'*', TRecord>()

      console.debug(
        `useDataStoreCreateBulk :: Query ${
          options?.queryName || '(unnamed)'
        } success`
      )

      if (error) {
        console.error(error)
        throw new Error(`API error`)
      }

      if (!data || !data.length) {
        throw new Error('Result is null or empty')
      }

      setIsCreating(false)
      setIsSuccess(true)
      setLastErrorCode(null)
      setCreatedDocs(data)

      return data as TRecord[]
    } catch (err) {
      setIsCreating(false)
      setIsSuccess(false)
      setLastErrorCode(getDataStoreErrorCodeFromError(err))

      console.error('Failed to create documents', err)
      handleError(err)

      throw err
    }
  }

  return [isCreating, isSuccess, lastErrorCode, create, clear, createdDocs]
}

export default useDataStoreCreateBulk
