import { useEffect, useRef } from 'react'

export default (callback: () => void, timer: number): (() => void) => {
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    },
    // todo: handle timer or callback changes
    []
  )

  return () => {
    timerRef.current = setTimeout(callback, timer)
  }
}
