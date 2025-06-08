import { useCallback, useEffect, useState } from 'react'
import useSupabaseClient from './useSupabaseClient'
import { handleError } from '../error-handling'

enum ErrorCode {
  Unknown = 0,
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
  const [lastResult, setLastResult] = useState<null | TRecord[]>(null)
  const supabase = useSupabaseClient()

  const callFunction = useCallback(
    async (payload?: TPayload) => {
      if (name === false) {
        return null
      }

      setIsLoading(true)
      setLastErrorCode(null)

      const { data, error } = await supabase.rpc(name, payload).select('*')

      if (error) {
        console.error(
          `Failed to use data store function "${name}": ${error.message}`
        )
        handleError(error)
        setLastErrorCode(ErrorCode.Unknown)
        return null
      }

      setLastResult(data)
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

    callFunction(autoCallPayload!)
  }, [autoCall])

  return [isLoading, lastErrorCode, lastResult, callFunction]
}

export default useDataStoreFunction
