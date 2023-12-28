import { useEffect, useState } from 'react'
import { client as supabase } from '../supabase'
import { handleError } from '../error-handling'

export default <TItem>(
  collectionName: string,
  queryName: string = 'unnamed',
  orderBy?: string
): [boolean, boolean, TItem[] | null, number | null, () => void] => {
  const [result, setResult] = useState<TItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isErrored, setIsErrored] = useState(false)
  const [totalCount, setTotalCount] = useState<number | null>(null)

  const hydrate = async () => {
    try {
      if (!collectionName) {
        console.debug(
          `useDataStoreItems :: ${queryName} :: no collection name - skipping`
        )
        return
      }

      console.debug(
        `useDataStoreItems :: ${collectionName} :: ${queryName} :: running getQuery`
      )

      setIsLoading(true)
      setIsErrored(false)

      let query = supabase.from(collectionName).select('*')

      // TODO: Do this better
      if (orderBy) {
        query = query.order(orderBy, { ascending: true })
      }

      const { error, data, count } = await query

      console.debug(
        `useDataStoreItems :: ${collectionName} :: ${queryName} :: query complete`,
        error,
        data,
        count
      )

      if (error) {
        throw new Error(
          `useDataStoreItems failed run query for collection "${collectionName}" query "${queryName}": ${error.code}: ${error.message} (${error.hint})`
        )
      }

      setResult(data as TItem[])
      setTotalCount(count || null)
      setIsLoading(false)
      setIsErrored(false)
    } catch (err) {
      console.error(err)
      handleError(err)
      // I thought React batched sets together but apparently not - set this first!
      setIsErrored(true)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    hydrate()
  }, [collectionName, queryName, orderBy])

  return [isLoading, isErrored, result, totalCount, hydrate]
}
