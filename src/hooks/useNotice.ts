import useNotices from './useNotices'

type IsHidden = boolean
type PermaHideFunc = () => void

const useNotice = (noticeId: string): [IsHidden, PermaHideFunc] => {
  const [hiddenNoticeIds, hideNoticeById] = useNotices()

  const isHidden = hiddenNoticeIds.includes(noticeId)

  const permaHide = () => hideNoticeById(noticeId)

  return [isHidden, permaHide]
}

export default useNotice
