export interface NoticeFields extends Record<string, any> {
  hideid: string
  title: string
  message: string
  orderby: number
  isvisible: boolean
}

export interface Notice extends NoticeFields {
  id: string
  createdby: string
  createdat: string
  lastmodifiedby: string
  lastmodifiedat: string
}

export interface FullNotice extends Notice {}

export enum CollectionNames {
  Notices = 'notices',
}

export enum ViewNames {
  GetFullNotices = 'getfullnotices',
}
