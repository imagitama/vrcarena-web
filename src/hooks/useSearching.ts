import { useEffect, useState, useRef } from 'react'
import { handleError } from '../error-handling'
import { client as supabase } from '../supabase'

export default <TResult>(
  tableName: string,
  searchTerm: string,
  selectStatement: string,
  fieldsToSearch: string[],
  getQuery?: (query: any) => any,
  limit: number = 50
): [boolean, boolean, TResult | null] => {
  const [results, setResults] = useState<TResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isErrored, setIsErrored] = useState(false)
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

        setResults((data as unknown) as TResult)
        setIsLoading(false)
        setIsErrored(false)
      } catch (err) {
        console.error(
          `useSearching :: "${tableName}" -> "${searchTerm}" :: Failed to search!`,
          err
        )
        setIsLoading(false)
        setIsErrored(true)
        handleError(err)
      }
    }

    setIsLoading(true)
    setIsErrored(false)

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
    getQuery
  ])

  return [isLoading, isErrored, results]
}
