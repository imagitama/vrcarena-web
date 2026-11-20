import { useState } from 'react'
import { handleError } from '@/error-handling'
import { callFunction } from '@/supabase'

export enum FunctionErrorCode {
  Unknown = 'unknown',
}

const getFunctionErrorCode = (err: Error) => {
  // TODO: finish
  return FunctionErrorCode.Unknown
}

type ClearFn = () => void

export default <TPayload extends Record<string, any>, TResult>(
  functionName: string
): [
  boolean,
  FunctionErrorCode | null,
  TResult | null,
  (payload: TPayload) => Promise<TResult>,
  ClearFn
] => {
  const [result, setResult] = useState<TResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<FunctionErrorCode | null>(
    null
  )

  console.debug(`useSupabaseFunction`, [isLoading, lastErrorCode, result])

  const performCall = async (payload: TPayload): Promise<TResult> => {
    try {
      console.debug(`useSupabaseFunction.performCall "${functionName}"`, {
        payload,
      })

      setIsLoading(true)
      setLastErrorCode(null)

      const data = await callFunction<TPayload, TResult>(functionName, payload)

      console.debug(`useSupabaseFunction.performCall "${functionName}" done`, {
        data,
      })

      setResult(data.data as unknown as TResult)
      setIsLoading(false)
      setLastErrorCode(null)

      // return data
      return data.data
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      setLastErrorCode(getFunctionErrorCode(err as Error))
      handleError(err)
      throw err
    }
  }

  const clear = () => {
    setResult(null)
    setIsLoading(false)
    setLastErrorCode(null)
  }

  return [isLoading, lastErrorCode, result, performCall, clear]
}
