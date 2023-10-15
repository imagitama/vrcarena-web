import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { scrollTo } from '../utils'

let scrollAmountsByUrl: { [url: string]: number } = {}

const useScrollMemory = (hasFinishedLoading = false) => {
  const { pathname } = useLocation()

  useEffect(() => {
    if (!hasFinishedLoading) {
      return
    }

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
