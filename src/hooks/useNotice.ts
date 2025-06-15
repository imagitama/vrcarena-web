import useNotices from './useNotices'

type IsHidden = boolean
type PermaHideFunc = () => void

const useNotice = (noticeId?: string): [IsHidden, PermaHideFunc] => {
  const [hiddenNoticeIds, hideNoticeById] = useNotices()

  const isHidden = noticeId ? hiddenNoticeIds.includes(noticeId) : false

  const permaHide = () => (noticeId ? hideNoticeById(noticeId) : undefined)

  return [isHidden, permaHide]
}

export default useNotice
