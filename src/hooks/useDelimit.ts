import { useEffect, useRef, useState } from 'react'

export default (
  callback: () => void,
  subscription: any[],
  timer = 500
): (() => void) | null => {
  const timerRef = useRef<NodeJS.Timeout>()
  const delimitedCallbackRef = useRef<(() => void) | null>(callback)
  const [, rerender] = useState(0)

  const regenerateCallback = () => {
    console.debug(`useDelimit REGENERATING`, callback)
    delimitedCallbackRef.current = callback
    rerender((currentVal) => currentVal + 1)
  }

  useEffect(() => {
    console.debug(`useDelimit.subchange`, subscription)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => regenerateCallback(), timer)
  }, subscription)

  console.debug(`useDelimit.render`, delimitedCallbackRef.current)

  return delimitedCallbackRef.current
}
