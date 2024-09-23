import { useCallback, useState } from 'react'
import { client as supabase } from '../supabase'

enum ErrorCode {
  Unknown = 0,
}

const useDataStoreFunction = <TPayload extends object, TResult>(
  name: string
): [
  boolean,
  null | ErrorCode,
  null | TResult,
  (payload: TPayload) => Promise<void>
] => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode>(null)
  const [lastResult, setLastResult] = useState<null | TResult>(null)

  const callFunction = useCallback(
    async (payload: TPayload) => {
      setIsLoading(true)
      setLastErrorCode(null)

      const { data, error } = await supabase
        .rpc('randomly_update_species_thumbnail', payload)
        .select('*')

      if (error) {
        console.error(
          `Failed to use data store function "${name}": ${error.message}`
        )
        setLastErrorCode(ErrorCode.Unknown)
        return
      }

      const result = data[0]

      setLastResult(result)
      setIsLoading(false)
      setLastErrorCode(null)

      return result
    },
    [name]
  )

  return [isLoading, lastErrorCode, lastResult, callFunction]
}

export default useDataStoreFunction
