export interface NoticeFields {
  hideid: string
  title: string
  message: string
  orderby: number
  isvisible: boolean
}

export interface Notice extends NoticeFields {
  id: string
  createdby: string
}

export interface FullNotice extends Notice {}

export const collectionName = 'notices'

export const NoticesFieldNames = {
  hideid: 'hideid',
  title: 'title',
  message: 'message',
  orderby: 'orderby',
  createdAt: 'createdat',
  isVisible: 'isvisible',
}

export const views = {
  getFullNotices: 'getFullNotices',
}
