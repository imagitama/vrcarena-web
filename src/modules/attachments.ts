export interface Attachment {
  id: string
  url: string
  type: 'image' | 'url'
  thumbnailurl: string
  parenttable: string
  parentid: string
  createdby: string
}

export interface FullAttachment extends Attachment {
  createdbyusername: string
}

export const attachmentTypes = {
  image: 'image',
  url: 'url'
}

export const attachmentSubTypes = {
  screenshot: 'screenshot',
  meme: 'meme',
  recording: 'recording',
  news: 'news'
}

export const AttachmentsFieldNames = {
  url: 'url',
  type: 'type',
  subType: 'subtype',
  title: 'title',
  thumbnailUrl: 'thumbnailurl',
  description: 'description',
  license: 'license',
  tags: 'tags',
  isAdult: 'isadult',
  parentTable: 'parenttable',
  parentId: 'parentid',
  createdBy: 'createdby',
  createdAt: 'createdat',
  lastModifiedBy: 'lastmodifiedby',
  lastModifiedAt: 'lastmodifiedat'
}
