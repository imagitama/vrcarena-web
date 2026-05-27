import { useCallback, useEffect, useState } from 'react'
import useSupabaseClient from './useSupabaseClient'
import { handleError } from '@/error-handling'
import { PostgrestError } from '@supabase/supabase-js'

export enum ErrorCode {
  Unknown = 0,
  UserNotVerified = 1,
  AlreadyInQueue
}

enum RpcErrorCode {
  USER_NOT_VERIFIED = 'USER_NOT_VERIFIED',
  ALREADY_IN_QUEUE = 'ALREADY_IN_QUEUE'
}

const getErrorCodeFromSupabaseError = (err: PostgrestError): ErrorCode => {
  if (err.code === 'P0001') {
    switch (err.hint) {
      case RpcErrorCode.ALREADY_IN_QUEUE:
        return ErrorCode.AlreadyInQueue
      case RpcErrorCode.USER_NOT_VERIFIED:
        return ErrorCode.UserNotVerified
      default:
        return ErrorCode.Unknown
    }
  } else {
    // TODO: re-use other error code stuff
    return ErrorCode.Unknown
  }
}

const useDataStoreFunction = <TPayload extends object, TRecord>(
  name: string | false,
  autoCall: boolean = false,
  autoCallPayload?: TPayload
): [
    boolean,
    null | ErrorCode,
    null | TRecord[],
    (payload?: TPayload) => Promise<null | TRecord[]>
  ] => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode>(null)
  const [lastResults, setLastResults] = useState<null | TRecord[]>(null)
  const supabase = useSupabaseClient()

  const callFunction = useCallback(
    async (payload?: TPayload): Promise<TRecord[] | null> => {
      if (name === false) {
        return null
      }

      if (!payload && autoCallPayload) {
        payload = autoCallPayload
      }

      setIsLoading(true)
      setLastErrorCode(null)

      const { data, error } = await supabase.rpc(name, payload).select('*')

      if (error) {
        console.error(
          `Failed to use data store function "${name}": ${error.message} ${error.hint}`
        )
        handleError(error)
        setLastErrorCode(getErrorCodeFromSupabaseError(error))
        return null
      }

      if (!data) {
        throw new Error('Data is null')
      }

      setLastResults(data)
      setIsLoading(false)
      setLastErrorCode(null)

      return data
    },
    [name]
  )

  useEffect(() => {
    if (!autoCall) {
      return
    }

    callFunction(autoCallPayload)
  }, [autoCall, JSON.stringify(autoCallPayload)])

  return [isLoading, lastErrorCode, lastResults, callFunction]
}

export default useDataStoreFunction
