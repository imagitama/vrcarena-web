import useStorage, { keys as storageKeys } from './useStorage'
import { trackAction } from '../analytics'
import { write as writeStorage } from '../utils/storage'

const useNotices = (): [string[], (idToHide: string) => void] => {
  const [hiddenNoticeIds] = useStorage<string[]>(storageKeys.hiddenNotices, [])

  const hideNoticeById = (hideId: string) => {
    writeStorage(
      storageKeys.hiddenNotices,
      (hiddenNoticeIds || []).concat([hideId])
    )
    trackAction('Global', 'Click hide notice', hideId)
  }

  return [hiddenNoticeIds || [], hideNoticeById]
}

export default useNotices
