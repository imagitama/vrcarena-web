import { useHistory } from 'react-router'
import { smoothScrollToTop } from '@/utils'

// this hook exists because on tab click we want to push() but we dont want to scroll which is annoying

export default () => {
  const useHistoryResult = useHistory()

  const pushWithScroll = (url: string, shouldScroll: boolean = true): void => {
    console.debug(`useHistory.pushWithScroll`, { url, shouldScroll })

    // attach some state so useScrollMemory doesn't kick in
    useHistoryResult.push(url, { state: { shouldScroll } })

    // TODO: investigate if actually needed as useScrollMemory does it for us
    if (shouldScroll) {
      smoothScrollToTop()
    }
  }

  return {
    ...useHistoryResult,
    push: pushWithScroll,
  }
}
