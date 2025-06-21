import { getIsBoothProductUrl } from '../booth'
import { getIsGumroadProductUrl } from '../gumroad'
import { getIsItchProductUrl } from '../itch'
import { getIsJinxxyProductUrl } from '../jinxxy'
import { getIsKofiProductUrl } from '../kofi'
import { getIsPayHipProductUrl } from '../payhip'

// shared with backend
export enum SyncPlatformName {
  Gumroad = 'gumroad',
  Booth = 'booth',
  Itch = 'itch',
  Jinxxy = 'jinxxy',
  Kofi = 'kofi',
  PayHip = 'payhip',
}

// shared with backend
export const getSyncPlatformNameFromUrl = (
  url: string
): SyncPlatformName | undefined => {
  if (getIsGumroadProductUrl(url)) {
    return SyncPlatformName.Gumroad
  }
  if (getIsBoothProductUrl(url)) {
    return SyncPlatformName.Booth
  }
  if (getIsItchProductUrl(url)) {
    return SyncPlatformName.Itch
  }
  if (getIsJinxxyProductUrl(url)) {
    return SyncPlatformName.Jinxxy
  }
  if (getIsKofiProductUrl(url)) {
    return SyncPlatformName.Kofi
  }
  if (getIsPayHipProductUrl(url)) {
    return SyncPlatformName.PayHip
  }
  return undefined
}

export const getCanSync = (url: string): boolean =>
  getSyncPlatformNameFromUrl(url) !== undefined

export enum SyncFieldTypes {
  Text = 'text',
  Markdown = 'markdown', // basically just description (shows the quote toggle)
  Number = 'number',
  ImageUrl = 'image-url',
  // Array = 'array',
  ArrayOfAttachments = 'array-of-attachments',
  Map = 'map',
  Constant = 'constant',
  RecordIds = 'record-ids',
  RecordId = 'record-id',
  ThumbnailFromUrls = 'thumbnail-from-urls',
  Attachments = 'attachments',
  Ignored = 'ignored', // asset attachmentsData
}

export interface SyncFieldBase<TRecord> {
  ourName: keyof TRecord
  label?: string
  theirName?: string
  type: SyncFieldTypes
}

export interface SyncFieldRecord<TRecord> extends SyncFieldBase<TRecord> {
  type: SyncFieldTypes.RecordId
  typeInfo: {
    table: string
  }
}

export interface SyncFieldRecords<TRecord> extends SyncFieldBase<TRecord> {
  type: SyncFieldTypes.RecordIds
  typeInfo: {
    table: string
  }
}

export type SyncField<TRecord> =
  | SyncFieldBase<TRecord>
  | SyncFieldRecord<TRecord>
  | SyncFieldRecords<TRecord>

export interface SyncPlatformInfo<TRecord> {
  platformName: SyncPlatformName
  fields: SyncField<TRecord>[]
}

//////

export type SyncFieldResult = SyncField<any> & {
  value: any
}

//////

export enum ErrorCode {
  NoExist, // 404
  BadPermissions, // 401
  BadRequest, // 400
  PlatformUnavailable, // 500?
  Other,
}

// result of function
export interface SyncResult {
  errorCode: string | null
  fields: SyncFieldResult[]
}

export enum SyncAttachmentType {
  IMAGE_URL = 'image-url',
  YOUTUBE_URL = 'youtube-url',
  VIDEO_URL = 'video-url',
}

export interface SyncAttachment {
  type: SyncAttachmentType
  value: string
  additionalData: any
}

export const cleanupSourceUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url)
    return `${parsedUrl.origin}${
      parsedUrl.pathname !== '/' ? parsedUrl.pathname : ''
    }`
  } catch (error) {
    return ''
  }
}
