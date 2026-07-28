export interface NoticeFields extends Record<string, any> {
  hideid: string
  title: string
  message: string
  orderby: number
  isvisible: boolean
}

export interface Notice extends NoticeFields {
  id: string
  lastmodifiedby: string | null
  lastmodifiedat: string | null
  createdby: string
  createdat: string
}

export interface FullNotice extends Notice {}

export enum CollectionNames {
  Notices = 'notices',
}

export enum ViewNames {
  GetFullNotices = 'getfullnotices',
}
