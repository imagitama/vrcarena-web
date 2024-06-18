import { useState } from 'react'
import { handleError } from '../error-handling'
import { client as supabase } from '../supabase'
import { mapFieldsForDatabase } from '../utils'
import {
  DataStoreErrorCode,
  getDataStoreErrorCodeFromError,
} from '../data-store'

export default <TRecord>(
  collectionName: string
): [
  boolean,
  boolean,
  null | DataStoreErrorCode,
  (
    fields: Partial<TRecord>,
    returnEntireDocument?: boolean,
    allowId?: boolean
  ) => Promise<string | TRecord>,
  () => void,
  null | string
] => {
  if (!collectionName) {
    throw new Error('Cannot create: no collection name provided')
  }

  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const [id, setId] = useState<null | string>(null)

  const clear = () => {
    setIsSuccess(false)
    setLastErrorCode(null)
    setIsCreating(false)
  }

  const create = async (
    fields: Partial<TRecord>,
    returnEntireDocument: boolean = false,
    allowId: boolean = false
  ): Promise<string | TRecord> => {
    try {
      setIsSuccess(false)
      setLastErrorCode(null)
      setIsCreating(true)

      // @ts-ignore
      if (fields.id && !allowId) {
        throw new Error(`Cannot provide an id when performing create`)
      }

      const fieldsForInsert = mapFieldsForDatabase(fields)

      const { data, error } = await supabase
        .from(collectionName)
        .insert(fieldsForInsert, {
          returning: 'representation',
        })

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

      const createdRecord = data[0]

      if (!createdRecord.id) {
        throw new Error('Created record did NOT have an "id" field')
      }

      setId(data[0].id as string)

      return returnEntireDocument
        ? (data[0] as TRecord)
        : (data[0].id as string)
    } catch (err) {
      setIsCreating(false)
      setIsSuccess(false)
      setLastErrorCode(getDataStoreErrorCodeFromError(err))

      console.error('Failed to create document', err)
      handleError(err)

      throw err
    }
  }

  return [isCreating, isSuccess, lastErrorCode, create, clear, id]
}
