import { DataStoreErrorCode } from '../data-store'
import useDatabaseQuery, { Operators } from './useDatabaseQuery'

type SearchClause<TRecord> = [keyof TRecord, Operators, string]

const useDataStoreExists = <TRecord>(
  collectionName: string,
  searchClauses: SearchClause<TRecord>[]
): [boolean, DataStoreErrorCode | null, boolean | null] => {
  const [isLoading, lastErrorCode, result] = useDatabaseQuery<TRecord>(
    collectionName,
    searchClauses
  )

  const exists = result === null ? null : result.length === 0 ? false : true

  return [isLoading, lastErrorCode, exists]
}

export default useDataStoreExists
