import useStorage, { keys as storageKeys } from './useStorage'
import { trackAction } from '../analytics'
import { write as writeStorage } from '../utils/storage'

const useNotices = (): [string[], (idToHide: string) => void] => {
  const [hiddenNotices] = useStorage<string[]>(storageKeys.hiddenNotices, [])

  const hideNotice = (hideId: string) => {
    writeStorage(
      storageKeys.hiddenNotices,
      (hiddenNotices || []).concat([hideId])
    )
    trackAction('Global', 'Click hide notice', hideId)
  }

  return [hiddenNotices || [], hideNotice]
}

export default useNotices
