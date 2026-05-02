export interface WhiteboardDotFields extends Record<string, any> {
  x: number
  y: number
  r: number
  g: number
  b: number
  a: number
}

export interface WhiteboardDot extends WhiteboardDotFields {
  id: string // uuidv4
  createdby: string
  createdat: string // date
}

export enum CollectionNames {
  Whiteboard = 'whiteboard',
}
