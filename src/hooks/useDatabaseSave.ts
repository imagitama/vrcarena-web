import { useState } from 'react'
import { handleError } from '../error-handling'
import { client as supabase } from '../supabase'

type Fields = { [fieldName: string]: any }

export default (
  collectionName: string | false,
  documentId: string | null = null,
  isDelete: boolean = false
): [
  boolean,
  boolean,
  null | Error,
  (fields?: Fields, id?: string) => Promise<(null | Fields)[]>,
  () => void
] => {
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastError, setLastError] = useState<null | Error>(null)

  const clear = () => {
    setIsSuccess(false)
    setLastError(null)
    setIsSaving(false)
  }

  const save = async (fields?: Fields, id?: string) => {
    // for amendments
    if (!collectionName) {
      return []
    }

    if (!isDelete) {
      if (!fields) {
        throw new Error('Need to pass fields')
      }
      if (fields.lastModifiedAt || fields.lastmodifiedat) {
        throw new Error('Never set the "lastModifiedAt" field when saving')
      }
      if (fields.lastModifiedBy || fields.lastmodifiedby) {
        throw new Error('Never set the "lastModifiedBy" field when saving')
      }
      if (fields.createdAt || fields.createdAt) {
        throw new Error('Never set the "createdAt" field when saving')
      }
      if (fields.createdBy || fields.createdBy) {
        throw new Error('Never set the "createdBy" field when saving')
      }
    }

    const idToSave = id || documentId

    setIsSuccess(false)
    setLastError(null)
    setIsSaving(true)

    try {
      console.debug('useDatabaseSave', collectionName, idToSave, fields)

      let returnData: null | Fields

      if (idToSave) {
        if (isDelete) {
          const { error } = await supabase
            .from(collectionName)
            .delete({ returning: 'representation' })
            .eq('id', idToSave)

          if ((Array.isArray(error) && error.length > 0) || error) {
            console.error(error)
            throw new Error(`Failed to delete docs`)
          }
        } else {
          if (!fields) {
            throw new Error('Need to pass fields')
          }

          const { error } = await supabase
            .from(collectionName)
            .update(fields, { returning: 'representation' })
            .eq('id', idToSave)

          if ((Array.isArray(error) && error.length > 0) || error) {
            throw error
          }
        }

        returnData = null
      } else {
        if (!fields) {
          throw new Error('Need to pass fields')
        }

        const { data, error } = await supabase
          .from(collectionName)
          .insert(fields, {
            returning: 'representation',
          })

        if ((Array.isArray(error) && error.length > 0) || error) {
          console.error(error)
          throw new Error(`Failed to insert doc`)
        }

        if (!data || !data.length || data.length === 0) {
          console.debug(data)
          throw new Error(`Unexpected result from insert`)
        }

        returnData = data[0]
      }

      setIsSuccess(true)
      setLastError(null)
      setIsSaving(false)

      return [returnData]
    } catch (err) {
      setIsSuccess(false)
      setLastError(err as Error)
      setIsSaving(false)
      console.error('Failed to save document', err)
      handleError(err)
      return []
    }
  }

  return [isSaving, isSuccess, lastError, save, clear]
}
