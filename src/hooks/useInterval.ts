import { useEffect, useRef } from 'react'

export default (func: () => void, interval: number = 1000) => {
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      func()
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [interval])
}
