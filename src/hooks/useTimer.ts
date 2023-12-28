import { useEffect, useRef } from 'react'

export default (
  callback: () => void,
  timer: number,
  autoStart: boolean = false
): (() => void) => {
  const timerRef = useRef<NodeJS.Timeout>()

  const startTimer = () => {
    timerRef.current = setTimeout(callback, timer)
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
    // todo: handle timer or callback changes
    [timer]
  )

  return startTimer
}
