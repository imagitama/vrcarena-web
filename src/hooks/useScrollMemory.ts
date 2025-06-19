import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { scrollTo } from '../utils'

let scrollAmountsByUrl: { [url: string]: number } = {}

const useScrollMemory = (hasFinishedLoading = false) => {
  const { pathname } = useLocation()
  const oldPathnameRef = useRef<string>()

  useEffect(() => {
    if (!hasFinishedLoading) {
      return
    }

    console.debug(
      'CHECK',
      oldPathnameRef.current,
      oldPathnameRef.current?.includes('/page'),
      pathname.includes('/page')
    )

    // ignore page navigations
    if (
      oldPathnameRef.current &&
      oldPathnameRef.current.includes('/page') &&
      pathname.includes('/page')
    ) {
      console.debug(`useScrollMemory ignoring page navigation`, {
        old: oldPathnameRef.current,
        new: pathname,
      })
      return
    }

    oldPathnameRef.current = pathname

    if (pathname in scrollAmountsByUrl) {
      console.debug(`useScrollMemory found a scroll amount, scrolling...`, {
        amount: scrollAmountsByUrl[pathname],
      })
      scrollTo(scrollAmountsByUrl[pathname], false)
    }

    const onScroll = () => {
      scrollAmountsByUrl[pathname] = Math.floor(window.scrollY)
    }

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [hasFinishedLoading, pathname])
}

export default useScrollMemory
