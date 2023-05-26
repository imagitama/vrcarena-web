export interface Comment {
  id: string
  comment: string
  isprivate: string
  parenttable: string
  parent: string
}

export interface CommentMeta {
  accessstatus: string
  editornotes: string
  createdat: Date
  createdby: string
}

export interface FullComment extends Comment, CommentMeta {
  createdbyusername: string
  createdbyavatarurl: string
  createdbyrole: string
}

// deprecated
export const CollectionNameComments = 'comments'
export const CollectionNameCommentsMeta = 'commentsmeta'

export const CollectionNames = {
  Comments: 'comments',
  CommentsMeta: 'commentsmeta'
}

export const CommentsMetaFieldNames = {
  accessStatus: 'accessstatus'
}
