import { QueuedItem } from '../queues'

interface ImageConvertQueueItemField {
  imageurl: string | string[] // thumbnailurl or fileurls TODO: More complex structures
  fieldname: string // eg. thumbnailurl
  bucketname: string
}

export type ImageConvertQueueResult = { [fieldName: string]: string | string[] }

export interface ImageConvertQueueItem extends QueuedItem {
  parent: string
  parenttable: string
  fields: ImageConvertQueueItemField[]
  result: ImageConvertQueueResult | null // url
}

export enum CollectionNames {
  ImageConvertQueue = 'imageconvertqueue',
}
