import { useState } from 'react'
import { handleError } from '../error-handling'
import { callFunction } from '../firebase'

export default <TPayload, TResult>(
  functionName: string
): [
  boolean,
  boolean,
  TResult | null,
  (payload: TPayload) => Promise<TResult>,
  () => void
] => {
  const [result, setResult] = useState<TResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isErrored, setIsErrored] = useState(false)

  const performCall = async (payload: TPayload): Promise<TResult> => {
    try {
      setIsLoading(true)
      setIsErrored(false)

      const data = await callFunction<TResult>(functionName, payload)

      setResult(data.data as unknown as TResult)
      setIsLoading(false)
      setIsErrored(false)

      return data.data
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      setIsErrored(true)
      handleError(err)
      throw err
    }
  }

  const clear = () => {
    setResult(null)
    setIsLoading(false)
    setIsErrored(false)
  }

  return [isLoading, isErrored, result, performCall, clear]
}
