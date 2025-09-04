import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { scrollTo, scrollToTop } from '../utils'

const scrollAmountsByUrl = new Map<string, number>()

const useScrollMemory = () => {
  const lastPathname = useRef<string | null>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    console.debug(`useScrollMemory.page-nav`, {
      old: lastPathname.current,
      new: pathname,
    })

    const onScroll = () => {
      scrollAmountsByUrl.set(pathname, Math.floor(window.scrollY))
    }

    const navigatedBetweenPages =
      lastPathname.current !== null && lastPathname.current !== pathname

    if (navigatedBetweenPages) {
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

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])
}

export default useScrollMemory
