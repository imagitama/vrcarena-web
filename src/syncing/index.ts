import {
  isBoothUrl,
  isDiscordUrl,
  isGumroadUrl,
  isItchProductUrl,
} from '../utils'

export enum SyncPlatformName {
  Gumroad,
  Booth,
  Discord,
  Itch,
  // etc.
}

export const getSyncPlatformNameFromUrl = (
  url: string
): SyncPlatformName | undefined => {
  // TODO: rename these  funcs to "isGumroadProductUrl" more explicit
  if (isGumroadUrl(url)) {
    return SyncPlatformName.Gumroad
  }
  if (isBoothUrl(url)) {
    return SyncPlatformName.Booth
  }
  if (isDiscordUrl(url)) {
    return SyncPlatformName.Discord
  }
  if (isItchProductUrl(url)) {
    return SyncPlatformName.Itch
  }
  return undefined
}

export const getCanSync = (url: string): boolean => getSyncPlatformNameFromUrl(url) !== undefined

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
