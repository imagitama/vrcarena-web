export interface Notification<TData> extends Record<string, any> {
  id: string
  recipient: string
  message: string
  parent: string
  parenttable: string
  data: TData
  createdat: Date
}

export interface FullNotification<TData, TParent> extends Notification<TData> {
  parentdata: TParent | null
}

export enum CollectionNames {
  Notifications = 'notifications',
}

export enum ViewNames {
  GetFullNotification = 'getfullnotification',
}
