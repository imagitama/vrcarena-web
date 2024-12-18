import { useEffect, useState, useRef } from 'react'
import { handleError } from '../error-handling'
import { client as supabase } from '../supabase'
import { setIsSearching } from '../modules/app'
import { useDispatch } from 'react-redux'
import { DataStoreErrorCode } from '../data-store'

export default <TRecord>(
  tableName: string,
  searchTerm: string,
  selectStatement: string,
  fieldsToSearch: (keyof TRecord)[],
  getQuery?: (query: any) => any,
  limit: number = 50
): [boolean, DataStoreErrorCode | null, TRecord[] | null] => {
  const [results, setResults] = useState<TRecord[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<DataStoreErrorCode | null>(
    null
  )
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!searchTerm) {
      return
    }

    const performSearch = async () => {
      try {
        console.debug(
          `useSearching :: "${tableName}" -> "${searchTerm}" :: Starting...`,
          selectStatement,
          fieldsToSearch
        )

        let query = supabase
          .from(tableName)
          .select(`id, ${selectStatement}`)
          .limit(limit || 50)

        for (const fieldToSearch of fieldsToSearch) {
          query = query.ilike(fieldToSearch, `*${searchTerm}*`)
        }

        if (getQuery) {
          query = getQuery(query)
        }

        const { error, data } = await query

        if (error) {
          throw new Error(
            `Failed to search: ${error.code}: ${error.message} (${error.hint})`
          )
        }

        console.debug(
          `useSearching :: "${tableName}" -> "${searchTerm}" :: Complete`,
          data
        )

        setResults(data as unknown as TRecord[])
        setIsLoading(false)
        setLastErrorCode(null)
      } catch (err) {
        console.error(
          `useSearching :: "${tableName}" -> "${searchTerm}" :: Failed to search!`,
          err
        )
        setIsLoading(false)
        setLastErrorCode(DataStoreErrorCode.Unknown) // TODO: Finish
        handleError(err)
      }
    }

    setIsLoading(true)
    setLastErrorCode(null)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => performSearch(), 500)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [
    tableName,
    searchTerm,
    selectStatement,
    fieldsToSearch.join(', '),
    getQuery,
  ])

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setIsSearching(isLoading))
  }, [isLoading])

  return [isLoading, lastErrorCode, results]
}
