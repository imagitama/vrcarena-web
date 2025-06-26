import { useEffect, useRef } from 'react'
import { formHideDelay } from '../config'

export default (
  callback?: () => void,
  delayMs: number = formHideDelay,
  autoStart: boolean = false
): (() => void) => {
  const timerRef = useRef<NodeJS.Timeout>()

  const startTimer = () => {
    if (!callback) {
      return
    }
    timerRef.current = setTimeout(callback, delayMs)
  }

  useEffect(
    () => {
      if (autoStart) {
        startTimer()
      }

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
      }
    },
    // handle callback changes eg. useCallback
    [callback !== undefined, delayMs]
  )

  return startTimer
}
