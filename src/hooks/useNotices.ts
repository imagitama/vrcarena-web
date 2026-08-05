import { trackAction } from '@/analytics'
import { read, write as writeStorage } from '@/utils/storage'
import useStorage, { keys as storageKeys } from './useStorage'

export const hideNoticeById = (hideId: string) => {
  const hiddenNoticeIds = read<string[]>(storageKeys.hiddenNotices)
  writeStorage(
    storageKeys.hiddenNotices,
    (hiddenNoticeIds || []).concat([hideId])
  )
  trackAction('Global', 'Click hide notice', hideId)
}

const useNotices = (): [string[], (idToHide: string) => void] => {
  const [hiddenNoticeIds] = useStorage<string[]>(storageKeys.hiddenNotices, [])
  return [hiddenNoticeIds || [], hideNoticeById]
}

export default useNotices
