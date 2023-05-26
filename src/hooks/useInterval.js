import { useEffect, useRef } from 'react'

export default (func, interval = 1000) => {
  const intervalRef = useRef()

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      func()
    }, interval)

    return () => clearInterval(intervalRef.current)
  }, [interval])
}
