import { RefObject, useEffect } from 'react'

const useClickAway = (ref: RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const handler = (event: any) => {
      if (!ref.current?.contains(event.target)) {
        callback()
      }
    }

    document.body.addEventListener('click', handler)

    return () => document.body.removeEventListener('click', handler)
  }, [callback])
}

export default useClickAway
