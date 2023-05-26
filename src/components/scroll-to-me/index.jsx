import React, { useRef } from 'react'
import { useEffect } from 'react'
import { scrollToElement } from '../../utils'

export default ({ children }) => {
  const ref = useRef()

  useEffect(() => {
    scrollToElement(ref.current, true, 50)
  }, [])

  return <div ref={ref}>{children}</div>
}
