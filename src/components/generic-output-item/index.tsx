import React from 'react'

import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
import {
  FullComment,
  CollectionNames as CommentsCollectionNames,
} from '@/modules/comments'
import {
  FullReview,
  CollectionNames as ReviewsCollectionNames,
} from '@/modules/reviews'
import {
  Amendment,
  CollectionNames as AmendmentsCollectionNames,
  FullAmendment,
} from '@/modules/amendments'
import { getUrlForParent } from '@/relations'

import AssetResultsItem from '@/components/asset-results-item'
import Comment from '@/components/comment'
import Link from '@/components/link'
import ReviewResultsItem from '@/components/review-results-item'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AmendmentResultsItem from '../amendment-results-item'

type Data = Asset | FullComment | FullReview | FullAmendment<any>

export default ({
  type,
  id,
  data: incomingData,
  small,
  extraProps,
}: {
  type: string
  id: string
  data?: Data
  small?: boolean
  extraProps?: any
}) => {
  const [isLoading, lastErrorCode, result] = useDataStoreItem<Data>(
    type,
    incomingData ? false : id
  )

  const data = incomingData || result

  if (!incomingData) {
    if (isLoading) return <LoadingIndicator message="Loading..." />
    if (lastErrorCode !== null)
      return (
        <ErrorMessage errorCode={lastErrorCode}>Failed to load</ErrorMessage>
      )
  }

  if (!data) {
    return (
      <Link to={getUrlForParent(type, id)}>
        View {type.substring(0, type.length - 1)}
      </Link>
    )
  }
  switch (type) {
    case AssetsCollectionNames.Assets:
      return (
        <AssetResultsItem
          asset={data as Asset}
          isTiny={small}
          {...extraProps}
        />
      )
    case AmendmentsCollectionNames.Amendments:
      return (
        <AmendmentResultsItem
          result={data as FullAmendment<any>}
          {...extraProps}
        />
      )
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
