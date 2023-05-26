import React, { useState, useEffect, useRef } from 'react'

export default ({ width, height }) => {
  const divRef = useRef()
  const [intendedHeight, setIntendedHeight] = useState(null)

  useEffect(() => {
    const onResize = () => {
      const actualWidth = divRef.current.offsetWidth
      const a = actualWidth / width
      const newHeight = height * a
      setIntendedHeight(newHeight)
    }

    window.addEventListener('resize', onResize)

    onResize()

    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div
      ref={divRef}
      style={{
        width: '100%',
        height: intendedHeight ? `${intendedHeight}px` : undefined
      }}
    />
  )
}
