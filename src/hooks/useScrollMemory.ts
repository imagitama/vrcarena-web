import { useEffect, useRef } from 'react'
import { matchPath, useLocation } from 'react-router'

import { scrollTo, scrollToTop } from '@/utils'
import { routes } from '@/routes'

const scrollAmountsByUrl = new Map<string, number>()

const getMatchedPattern = (pathname: string): string | null => {
  for (const pattern of Object.values(routes)) {
    if (matchPath(pathname, pattern)) {
      return pattern
    }
  }
  return null
}

const getHasNavigatedBetweenPages = (
  lastPathname: string | null,
  currentPathname: string | null
): boolean => {
  if (lastPathname === currentPathname) {
    return false
  }

  if (lastPathname === null || currentPathname === null) {
    return true
  }

  const lastPattern = getMatchedPattern(lastPathname)
  const currentPattern = getMatchedPattern(currentPathname)

  if (lastPattern !== null && lastPattern === currentPattern) {
    return false
  }

  return true
}

const useScrollMemory = () => {
  const lastPathname = useRef<string | null>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    // console.debug(`useScrollMemory.page-nav`, {
    //   old: lastPathname.current,
    //   new: pathname,
    // })

    const hasNavigatedBetweenPages = getHasNavigatedBetweenPages(
      lastPathname.current,
      pathname
    )

    if (hasNavigatedBetweenPages) {
      console.debug(
        `useScrollMemory.page-nav between pages -> scrolling to top`
      )

      scrollToTop(false)
    } else if (scrollAmountsByUrl.has(pathname)) {
      const amount = scrollAmountsByUrl.get(pathname)!

      console.debug(
        `useScrollMemory.page-nav NOT between pages and is stored -> scrolling to ${amount}`
      )

      scrollTo(amount, false)
    }

    lastPathname.current = pathname

    const onScroll = () => {
      scrollAmountsByUrl.set(pathname, Math.floor(window.scrollY))
    }

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])
}

export default useScrollMemory
