import { useState } from 'react'
import { handleError } from '../error-handling'
import { client as supabase } from '../supabase'
import { mapFieldsForDatabase } from '../utils'

export default <TFields, TRecord = void>(
  collectionName: string
): [
  boolean,
  boolean,
  boolean,
  (
    fields: TFields,
    returnEntireDocument?: boolean
  ) => Promise<string | TRecord>,
  () => void,
  null | string
] => {
  if (!collectionName) {
    throw new Error('Cannot create: no collection name provided')
  }

  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isErrored, setIsErrored] = useState<boolean>(false)
  const [id, setId] = useState<null | string>(null)

  const clear = () => {
    setIsSuccess(false)
    setIsErrored(false)
    setIsCreating(false)
  }

  const create = async (
    fields: TFields,
    returnEntireDocument: boolean = false
  ): Promise<string | TRecord> => {
    try {
      setIsSuccess(false)
      setIsErrored(false)
      setIsCreating(true)

      // @ts-ignore
      if (fields.id) {
        throw new Error(`Cannot provide an id when performing create`)
      }

      const fieldsForInsert = mapFieldsForDatabase(fields)

      const { data, error } = await supabase
        .from(collectionName)
        .insert(fieldsForInsert, {
          returning: 'representation',
        })

      if (!data || !data.length) {
        throw new Error('Result is null or empty')
      }

      if (error) {
        console.error(error)
        throw new Error(`API error`)
      }

      setIsCreating(false)
      setIsSuccess(true)
      setIsErrored(false)

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
      setIsErrored(true)

      console.error('Failed to create document', err)
      handleError(err)

      throw err
    }
  }

  return [isCreating, isSuccess, isErrored, create, clear, id]
}
