import { Operators } from './hooks/useDatabaseQuery'
import { client as supabase } from './supabase'

export const readRecord = async (collectionName, id) => {
  const { data, error } = await supabase
    .from(collectionName)
    .select('*')
    .eq('id', id)

  if (error) {
    throw new Error(
      `Failed to read record ${id} from collection ${collectionName}: ${
        error.code
      }: ${error.message}`
    )
  }

  if (data.length === 1) {
    return data[0]
  }

  throw new Error(
    `Failed to read record ${id} from collection ${collectionName}: result count not equal to 1 (equals ${
      data.length
    })`
  )
}
