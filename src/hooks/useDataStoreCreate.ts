import { useState } from 'react'
import { handleError } from '@/error-handling'
import {
  DataStoreError,
  DataStoreErrorCode,
  DataStoreOptions,
  getDataStoreErrorCodeFromError,
} from '@/data-store'
import useSupabaseClient from './useSupabaseClient'

type ClearFn = () => void

const useDataStoreCreate = <
  TFields extends Record<string, unknown>,
  TRecord extends Record<string, unknown> = TFields
>(
  collectionName: string,
  options: DataStoreOptions = {}
): [
  boolean,
  boolean,
  null | DataStoreErrorCode,
  (fields: Partial<TRecord>) => Promise<TRecord>,
  ClearFn,
  null | TRecord
] => {
  if (!collectionName) {
    throw new Error('Cannot create: no collection name provided')
  }

  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const [createdRecord, setCreatedRecord] = useState<null | TRecord>(null)
  const supabase = useSupabaseClient()

  const clear = () => {
    setIsSuccess(false)
    setLastErrorCode(null)
    setIsCreating(false)
  }

  const create = async (fields: Partial<TRecord>): Promise<TRecord> => {
    try {
      setIsSuccess(false)
      setLastErrorCode(null)
      setIsCreating(true)

      console.debug(
        `useDataStoreCreate :: ${
          options.queryName || '(unnamed)'
        } :: ${collectionName} :: create`,
        fields
      )

      let query = supabase
        .from<any, { Row1: TRecord; Insert: TRecord }>(collectionName)
        .insert([fields as TRecord])

      if (options.selectAfter !== false) {
        // @ts-ignore
        query = query.select<'*', TRecord>('*')
      }

      const { data, error } = await query

      if (error) {
        console.error(error)
        throw new DataStoreError('useDataStoreCreate failed', error)
      }

      if (!data || !Array.isArray(data)) throw new Error('')

      if ((data as TRecord[]).length !== 1) {
        throw new Error(`Count is ${(data as TRecord[]).length}`)
      }

      const createdRecord = data[0]

      console.debug(
        `useDataStoreCreate :: ${
          options.queryName || '(unnamed)'
        } :: ${collectionName} :: success`,
        createdRecord
      )

      setIsCreating(false)
      setIsSuccess(true)
      setLastErrorCode(null)

      setCreatedRecord(data[0])

      return createdRecord
    } catch (err) {
      setIsCreating(false)
      setIsSuccess(false)
      setLastErrorCode(getDataStoreErrorCodeFromError(err))

      console.error('Failed to create document', err)
      handleError(err)

      throw err
    }
  }

  return [isCreating, isSuccess, lastErrorCode, create, clear, createdRecord]
}

export default useDataStoreCreate
