import { useEffect, useRef, useState } from 'react'

export default (
  callback: (...args: any[]) => any,
  subscription: any[],
  timer = 500
): ((...args: any[]) => any) | null => {
  const timerRef = useRef<NodeJS.Timeout>()
  const delimitedCallbackRef = useRef<(() => void) | null>(callback)
  const [, rerender] = useState(0)

  const regenerateCallback = () => {
    delimitedCallbackRef.current = callback
    rerender((currentVal) => currentVal + 1)
  }

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => regenerateCallback(), timer)
  }, subscription)

  return delimitedCallbackRef.current
}
