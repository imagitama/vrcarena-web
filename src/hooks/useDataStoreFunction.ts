import { useCallback, useEffect, useState } from 'react'
import useSupabaseClient from './useSupabaseClient'
import { handleError } from '@/error-handling'
import { PostgrestError } from '@supabase/supabase-js'
import { DataStoreErrorCode, PostgresErrorCode } from '@/data-store'

export enum ErrorCode {
  Unknown = 0,
}

// TODO: move to caller

const getErrorCodeFromSupabaseError = (
  err: PostgrestError,
  knownErrorCodes: string[]
): ErrorCode | string => {
  if (err.code === PostgresErrorCode.Custom) {
    if (knownErrorCodes.includes(err.hint)) {
      return err.hint
    }
  }

  return ErrorCode.Unknown
}

/**
 * Used to call a Postgres RPC function. These functions can return *anything* including rows of records or a JSON object.
 *
 * I use the "hint" system of Postgres to return error codes (instead of jamming custom error codes into Postgres).
 * You must provide all known error codes so we can retrieve them.
 */
const useDataStoreFunction = <TPayload extends object, TResult>(
  name: string | false,
  knownErrorCodes: string[],
  autoCall: boolean = false,
  autoCallPayload?: TPayload
): [
  boolean,
  null | ErrorCode | string,
  null | TResult,
  (payload?: TPayload) => Promise<null | TResult>
] => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode | string>(
    null
  )
  const [lastResult, setLastResult] = useState<null | TResult>(null)
  const supabase = useSupabaseClient()

  const callFunction = useCallback(
    async (payload?: TPayload): Promise<TResult | null> => {
      if (name === false) {
        return null
      }

      if (!payload && autoCallPayload) {
        payload = autoCallPayload
      }

      setIsLoading(true)
      setLastErrorCode(null)

      console.debug(`useDataStoreFunction :: ${name}`, { payload })

      const { data, error } = await supabase.rpc(name, payload).select('*')

      console.debug(`useDataStoreFunction :: ${name} :: result`, {
        data,
        error,
      })

      if (error) {
        console.error(
          `Failed to use data store function "${name}": ${error.message} ${error.hint}`
        )
        if (error.code !== PostgresErrorCode.Custom) {
          handleError(error)
        }
        setIsLoading(false)
        setLastErrorCode(getErrorCodeFromSupabaseError(error, knownErrorCodes))
        return null
      }

      if (!data) {
        throw new Error('Data is null')
      }

      setLastResult(data as TResult)
      setIsLoading(false)
      setLastErrorCode(null)

      return data as TResult
    },
    [name]
  )

  useEffect(() => {
    if (!autoCall) {
      return
    }

    callFunction(autoCallPayload)
  }, [autoCall, JSON.stringify(autoCallPayload)])

  return [isLoading, lastErrorCode, lastResult, callFunction]
}

export default useDataStoreFunction
