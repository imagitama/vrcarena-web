import React from 'react'

import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
import {
  Author,
  CollectionNames as AuthorsCollectionNames,
} from '@/modules/authors'
import {
  FullComment,
  CollectionNames as CommentsCollectionNames,
} from '@/modules/comments'
import { getUrlForParent } from '@/relations'

import Link from '@/components/link'

const GenericOutputLabel = ({
  type,
  id,
  data,
}: {
  type: string
  id: string
  data?: Asset | FullComment | Author
}) => {
  if (!data) {
    return (
      <Link to={getUrlForParent(type, id)}>
        View {type.substring(0, type.length - 1)}
      </Link>
    )
  }
  switch (type) {
    case AssetsCollectionNames.Assets:
      return <Link to={getUrlForParent(type, id)}>{data.title}</Link>
    case AuthorsCollectionNames.Authors:
      return <Link to={getUrlForParent(type, id)}>{data.name}</Link>
    case CommentsCollectionNames.Comments:
      return (
        <Link to={getUrlForParent(type, id)}>{data.createdbyusername}</Link>
      )
    default:
      return <>Invalid type "{type}"</>
  }
}

export default GenericOutputLabel
