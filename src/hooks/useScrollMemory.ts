import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { scrollTo } from '../utils'

let scrollAmountsByUrl: { [url: string]: number } = {}

const useScrollMemory = (hasFinishedLoading = false) => {
  const { pathname } = useLocation()
  const oldPathnameRef = useRef(pathname)

  useEffect(() => {
    if (!hasFinishedLoading) {
      return
    }

    // ignore page navigations
    if (
      oldPathnameRef.current &&
      oldPathnameRef.current.includes('/page') &&
      pathname.includes('/page')
    ) {
      return
    }

    oldPathnameRef.current = pathname

    if (pathname in scrollAmountsByUrl) {
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
