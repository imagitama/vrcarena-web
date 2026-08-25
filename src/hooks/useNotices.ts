import { trackAction } from '@/analytics'
import { read, write as writeStorage } from '@/utils/storage'
import useStorage from './useStorage'

export const STORAGE_KEY = 'hiddenNotices'

export const hideNoticeById = (hideId: string) => {
  const hiddenNoticeIds = read<string[]>(STORAGE_KEY)
  writeStorage(STORAGE_KEY, (hiddenNoticeIds || []).concat([hideId]))
  trackAction('Global', 'Click hide notice', hideId)
}

const useNotices = (): [string[], (idToHide: string) => void] => {
  const [hiddenNoticeIds] = useStorage<string[]>(STORAGE_KEY, [])
  return [hiddenNoticeIds || [], hideNoticeById]
}

export default useNotices
