import { useEffect, useRef, useState } from 'react'
import { inDevelopment } from '../environment'
import { handleError } from '../error-handling'
import {
  DataStoreErrorCode,
  getDataStoreErrorCodeFromError,
} from '../data-store'
import useSupabaseClient from './useSupabaseClient'

export enum Operators {
  IS = 'IS', // works for NULL vals
  EQUALS = 'eq',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  ARRAY_CONTAINS = 'array-contains',
}

export enum WhereOperators {
  OR = 'or',
}

export enum OrderDirections {
  ASC,
  DESC,
}

export function getWhereClausesAsString<TRecord>(
  whereClauses: PossibleWhereClauses<TRecord>
): string {
  if (whereClauses === undefined) {
    return 'undefined'
  }
  if (whereClauses === false) {
    return 'false'
  }
  if (getIsGettingSingleRecord(whereClauses)) {
    return whereClauses.toString()
  }
  if (Array.isArray(whereClauses)) {
    return whereClauses
      .map((item) =>
        Array.isArray(item)
          ? `[${item[0] as string},${item[1]},${item[2]}]`
          : item
      )
      .join(',')
  }
  return whereClauses
}

interface DatabaseResult {
  id: string
}

function getStartAfterAsString(startAfter: DatabaseResult | undefined): string {
  if (!startAfter) {
    return ''
  }
  return startAfter.id
}

function getIsGettingSingleRecord(whereClauses: any): boolean {
  return typeof whereClauses === 'string'
}

function getLimitAsString(limit: number | undefined): string {
  if (!limit) {
    return ''
  }
  return limit.toString()
}

export function getOrderByAsString(orderBy?: OrderBy<any>): string {
  if (!orderBy) {
    return ''
  }
  return orderBy.join('+')
}

const getOptionsIfProvided = (
  maybeOptions: OptionsMap<any> | number | undefined
): OptionsMap<any> | false => {
  if (typeof maybeOptions === 'object') {
    return maybeOptions
  } else {
    return false
  }
}

export type WhereClause<TRecord> = [
  keyof TRecord,
  Operators,
  string | boolean | null
]

type OrderBy<TRecord> = [keyof TRecord, OrderDirections]

interface OptionsMap<TRecord> {
  queryName?: string
  limit?: number
  startAfter?: DatabaseResult
  orderBy?: OrderBy<TRecord>
  offset?: number
  supabase?: {
    foreignTable?: string
  }
  selectQuery?: string
  subscribe?: boolean // not supported in supabase (without setup)
}

type PossibleWhereClauses<TRecord> =
  | (WhereClause<TRecord> | WhereOperators.OR)[]
  | false

type ClearFn = () => void
type HydrateFn = () => void

export default <TRecord>(
  collectionName: string,
  whereClauses: PossibleWhereClauses<TRecord>,
  limitOrOptions?: number | OptionsMap<TRecord>,
  orderBy?: OrderBy<TRecord>,
  subscribe = true,
  startAfter = undefined
): [
  boolean,
  null | DataStoreErrorCode,
  TRecord[] | null,
  HydrateFn,
  number | null,
  ClearFn
] => {
  const [records, setRecords] = useState<TRecord[] | null>(null)
  const [count, setCount] = useState<null | number>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastErrorCode, setLastErrorCode] = useState<null | DataStoreErrorCode>(
    null
  )
  const isUnmountedRef = useRef(false)

  const options: OptionsMap<TRecord> = getOptionsIfProvided(limitOrOptions) || {
    limit: typeof limitOrOptions === 'number' ? limitOrOptions : undefined,
    orderBy,
    subscribe,
    startAfter,
  }

  const whereClausesAsString = getWhereClausesAsString(whereClauses)
  const orderByAsString = getOrderByAsString(options.orderBy)
  const startAfterAsString = getStartAfterAsString(options.startAfter)
  const limitAsString = getLimitAsString(options.limit)
  const offset = options.offset

  const supabase = useSupabaseClient()

  async function doIt(initiallyLoading = true) {
    try {
      console.debug(
        `useDatabaseQuery :: ${
          options.queryName || '(unnamed)'
        } :: ${collectionName} :: where=${whereClausesAsString} limit=${limitAsString} order=${orderByAsString} startAfter=${startAfterAsString}`
      )

      if (initiallyLoading) {
        setIsLoading(true)
        setLastErrorCode(null)
      }

      const selectQuery = options.selectQuery || '*'

      let queryChain = supabase
        .from(collectionName.toLowerCase())
        .select<string, TRecord>(selectQuery, { count: 'exact' })

      // or an array of searches
      if (Array.isArray(whereClauses)) {
        const isOrStatement = whereClauses.find(
          (item) => item === WhereOperators.OR
        )

        if (isOrStatement) {
          const orStatement = whereClauses
            .filter((item) => typeof item !== 'string')
            .map(
              // @ts-ignore
              ([field, operator, value]: WhereClause) =>
                `${field}.${operator}.${value}`
            )
            .join(',')

          queryChain = queryChain.or(
            orStatement,
            options.supabase
              ? {
                  foreignTable: options.supabase.foreignTable,
                }
              : {}
          )
        } else {
          // @ts-ignore
          for (const [field, operator, value] of whereClauses) {
            switch (operator) {
              case Operators.NOT_EQUALS:
                // @ts-ignore
                queryChain = queryChain.not(field, 'eq', value)
                break
              case Operators.IS:
                // supports "IS NULL" SQL operator
                // @ts-ignore
                queryChain = queryChain.is(field, value)
                break
              case Operators.GREATER_THAN:
                // @ts-ignore
                queryChain = queryChain.gt(field, value)
                break
              case Operators.ARRAY_CONTAINS:
                const valueToUse = Array.isArray(value) ? value : [value]
                // @ts-ignore
                queryChain = queryChain.contains(field, valueToUse)
                break
              default:
                // @ts-ignore
                queryChain = queryChain.filter(field, operator, value)
            }
          }
        }
        // or undefined - all results
      } else {
      }

      if (options.limit) {
        queryChain = queryChain.limit(options.limit)
      }

      if (options.orderBy) {
        queryChain = queryChain.order(options.orderBy[0] as string, {
          ascending: options.orderBy[1] === OrderDirections.ASC,
        })
      }

      if (options.offset && options.limit) {
        queryChain = queryChain.range(
          options.offset,
          options.offset + options.limit
        )
      }

      const result = await queryChain

      console.debug(
        `useDatabaseQuery :: ${
          options.queryName || '(unnamed)'
        } :: ${collectionName} :: query complete`,
        result
      )

      if (isUnmountedRef.current) {
        console.debug(
          `useDatabaseQuery :: ${
            options.queryName || '(unnamed)'
          } :: ${collectionName} :: query complete but component has unmounted, skipping re-render...`
        )
        return
      }

      if (result.error) {
        if (result.error.message.includes('JWT expired')) {
          setIsLoading(false)
          setLastErrorCode(DataStoreErrorCode.AuthExpired)
        } else {
          throw new Error(
            `Failed to query database: ${result.error.code}: ${result.error.message}`
          )
        }
      } else {
        // weird timing issue where loading=false but users=null so set it before the other flags
        setRecords(result.data)
        setCount(result.count)
        setIsLoading(false)
        setLastErrorCode(null)
      }
    } catch (err) {
      console.error('Failed to use database query', err)
      setIsLoading(false)
      setLastErrorCode(getDataStoreErrorCodeFromError(err))
      handleError(err)
    }
  }

  useEffect(() => {
    // fix setting state on unmounted component
    isUnmountedRef.current = false

    if (whereClauses === false) {
      setIsLoading(false)

      return () => {
        isUnmountedRef.current = true
      }
    }

    doIt()

    return () => {
      isUnmountedRef.current = true
    }
  }, [
    collectionName,
    whereClausesAsString,
    orderByAsString,
    startAfterAsString,
    limitAsString,
    offset,
    options.supabase && options.supabase.foreignTable,
  ])

  const hydrate = () => {
    if (whereClauses === false) {
      return
    }
    doIt(false)
  }

  const clear = () => {
    setIsLoading(false)
    setRecords(null)
    setCount(null)
    setLastErrorCode(null)
  }

  return [isLoading, lastErrorCode, records, hydrate, count, clear]
}
