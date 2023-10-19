import React from 'react'
import { CollectionNames } from '../../hooks/useDatabaseQuery'

import AssetResultsItem from '../../components/asset-results-item'
import { Asset } from '../../modules/assets'
import Comment from '../comment'
import { Comment as CommentData } from '../../modules/comments'
import Link from '../link'
import { getUrlForParent } from '../../relations'

export default ({
  type,
  id,
  data
}: {
  type: string
  id: string
  data?: Asset | CommentData
}) => {
  if (!data) {
    return (
      <Link to={getUrlForParent(type, id)}>
        View {type.substring(0, type.length - 1)}
      </Link>
    )
  }
  switch (type) {
    case CollectionNames.Assets:
      return <AssetResultsItem asset={data as Asset} isLandscape />
    case CollectionNames.Comments:
      return (
        <Comment comment={data as CommentData} showControls={false} shorten />
      )
    default:
      return <>Invalid type "{type}"</>
  }
}
