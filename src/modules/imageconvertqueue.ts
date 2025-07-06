export enum ImageConvertQueueItemStatus {
  Queued = 'queued',
  // Processing = 'processing',
  Processed = 'processed',
  Failed = 'failed',
}

interface ImageConvertQueueItemField {
  imageurl: string | string[] // thumbnailurl or fileurls
  fieldname: string // eg. thumbnailurl
}

export interface ImageConvertQueueItem {
  id: string // uuidv4
  status: ImageConvertQueueItemStatus
  parent: string
  parenttable: string
  fields: ImageConvertQueueItemField[]
  queuedat: Date
}

export enum CollectionNames {
  ImageConvertQueue = 'imageconvertqueue',
}
