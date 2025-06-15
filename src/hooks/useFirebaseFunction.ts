import { useState } from 'react'
import { handleError } from '../error-handling'
import { callFunction } from '../firebase'

export enum FirebaseErrorCode {
  Unknown = 'unknown',
}

const getFirebaseErrorCode = (err: Error) => {
  // TODO: finish
  return FirebaseErrorCode.Unknown
}

type ClearFn = () => void

export default <TPayload, TResult>(
  functionName: string
): [
  boolean,
  FirebaseErrorCode | null,
  TResult | null,
  (payload: TPayload) => Promise<TResult>,
  ClearFn
] => {
  const [result, setResult] = useState<TResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<FirebaseErrorCode | null>(
    null
  )

  const performCall = async (payload: TPayload): Promise<TResult> => {
    try {
      setIsLoading(true)
      setLastErrorCode(null)

      const data = await callFunction<TPayload, TResult>(functionName, payload)

      setResult(data.data as unknown as TResult)
      setIsLoading(false)
      setLastErrorCode(null)

      return data.data
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      setLastErrorCode(getFirebaseErrorCode(err as Error))
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
