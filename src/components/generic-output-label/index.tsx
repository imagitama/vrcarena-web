import React from 'react'

import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
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
  data?: Asset | FullComment
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
    case CommentsCollectionNames.Comments:
      return (
        <Link to={getUrlForParent(type, id)}>{data.createdbyusername}</Link>
      )
    default:
      return <>Invalid type "{type}"</>
  }
}

export default GenericOutputLabel
