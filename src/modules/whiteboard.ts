export interface WhiteboardDot {
  x: number
  y: number
  r: number
  g: number
  b: number
  a: number
  t: number // Date.now()
}

export interface WhiteboardRecordForUser extends Record<string, any> {
  id: string // userId
  dots: WhiteboardDot[]
  lastmodifiedby: string
  lastmodifiedat: string // date
  createdby: string
  createdat: string // date
}

export enum CollectionNames {
  Whiteboard = 'whiteboard',
}
