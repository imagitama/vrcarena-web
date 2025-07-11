import { useHistory } from 'react-router'
import { smoothScrollToTop } from '../utils'

// this hook exists because on tab click we want to push() but we dont want to scroll which is annoying

export default () => {
  const useHistoryResult = useHistory()

  const pushWithScroll = (url: string, shouldScroll: boolean = true): void => {
    useHistoryResult.push(url)
    if (shouldScroll) {
      smoothScrollToTop()
    }
  }

  return {
    ...useHistoryResult,
    push: pushWithScroll,
  }
}
