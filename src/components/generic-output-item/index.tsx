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
import {
  FullReview,
  Review,
  CollectionNames as ReviewsCollectionNames,
} from '../../modules/reviews'
import Link from '../link'
import { getUrlForParent } from '../../relations'
import ReviewResultsItem from '../review-results-item'

export default ({
  type,
  id,
  data,
}: {
  type: string
  id: string
  data?: Asset | FullComment | FullReview
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
    case ReviewsCollectionNames.Reviews:
      return <ReviewResultsItem review={data as FullReview} includeAsset />
    default:
      return <>Cannot render generic output item: invalid type "{type}"</>
  }
}
