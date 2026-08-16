import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const scrollPositions = new Map<string, number>()
const debounceMs = 100
const getScrollTop = () => window.scrollY
const setScrollTop = (value: number) => window.scrollTo(0, value)

const useScrollMemory = (attemptKey: string | false) => {
  const location = useLocation()
  const key = location.pathname + location.search

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!attemptKey) return
    const savedScrollPos = scrollPositions.get(key)
    requestAnimationFrame(() => {
      console.debug(
        `useScrollMemory :: ${key} :: restore to ${savedScrollPos || 'none'}`
      )
      setScrollTop(savedScrollPos ?? 0)
    })
  }, [key, attemptKey])

  useEffect(() => {
    const onScroll = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        const newScrollTop = getScrollTop()
        scrollPositions.set(key, newScrollTop)
        console.debug(`useScrollMemory :: ${key} :: store ${newScrollTop}`)
      }, debounceMs)
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [key, debounceMs, getScrollTop])
}

export default useScrollMemory
