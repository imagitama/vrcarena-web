import React from 'react'
import AssetResultsItem from '../../components/asset-results-item'
import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from '../../modules/assets'
import Comment from '../comment'
import {
  FullComment,
  CollectionNames as CommentsCollectionNames,
} from '../../modules/comments'
import Link from '../link'
import { getUrlForParent } from '../../relations'

export default ({
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
      return <AssetResultsItem asset={data as Asset} />
    case CommentsCollectionNames.Comments:
      return (
        <Comment comment={data as FullComment} showControls={false} shorten />
      )
    default:
      return <>Invalid type "{type}"</>
  }
}
