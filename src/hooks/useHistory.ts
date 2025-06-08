import { useHistory } from 'react-router'
import { scrollToTop } from '../utils'

// this hook exists because on tab click we want to push() but we dont want to scroll which is annoying

export default () => {
  const useHistoryResult = useHistory()

  const pushWithScroll = (url: string, shouldScroll: boolean = true): void => {
    useHistoryResult.push(url)
    if (shouldScroll) {
      scrollToTop(false)
    }
  }

  return {
    ...useHistoryResult,
    push: pushWithScroll
  }
}
