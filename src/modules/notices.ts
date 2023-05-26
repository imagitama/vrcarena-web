export interface Notice {
  id: string
  hideid: string
  title: string
  message: string
  orderby: number
  isvisible: boolean
  createdby: string
}

export const collectionName = 'notices'

export const NoticesFieldNames = {
  hideid: 'hideid',
  title: 'title',
  message: 'message',
  orderby: 'orderby',
  createdAt: 'createdat',
  isVisible: 'isvisible'
}

export const views = {
  getFullNotices: 'getFullNotices'
}
