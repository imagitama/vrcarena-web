import { useState } from 'react'
import { handleError } from '../error-handling'
import { client as supabase } from '../supabase'
import { mapFieldsForDatabase } from '../utils'

export default <TFields>(
  collectionName: string,
  id: string
): [
  boolean,
  boolean,
  boolean,
  (fields: TFields) => Promise<void>,
  () => void
] => {
  if (!collectionName) {
    throw new Error('Cannot edit: no collection name provided')
  }
  if (!id) {
    throw new Error('Cannot edit: no ID provided!')
  }

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isErrored, setIsErrored] = useState<boolean>(false)

  const clear = () => {
    setIsSuccess(false)
    setIsErrored(false)
    setIsEditing(false)
  }

  const save = async (fields: TFields) => {
    try {
      setIsSuccess(false)
      setIsErrored(false)
      setIsEditing(true)

      // @ts-ignore
      if (fields.id) {
        throw new Error(
          `Cannot provide an id when performing update (use hook parameter)`
        )
      }

      const fieldsForInsert = mapFieldsForDatabase(fields)

      const { error } = await supabase
        .from(collectionName)
        .insert(fieldsForInsert, {
          returning: 'representation'
        })

      if (error) {
        console.error(error)
        throw new Error(`API error`)
      }

      setIsEditing(false)
      setIsSuccess(true)
      setIsErrored(false)
    } catch (err) {
      setIsEditing(false)
      setIsSuccess(false)
      setIsErrored(true)

      console.error('Failed to save document', err)
      handleError(err)
    }
  }

  return [isEditing, isSuccess, isErrored, save, clear]
}
