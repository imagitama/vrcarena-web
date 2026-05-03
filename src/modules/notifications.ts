export interface Notification extends Record<string, any> {
  id: string
  recipient: string
  message: string
  parent: string
  parenttable: string
  data: Object
  createdat: Date
}

export interface FullNotification extends Notification {
  parentdata: Object
}

export enum CollectionNames {
  Notifications = 'notifications',
}

export enum ViewNames {
  GetFullNotification = 'getfullnotification',
}
