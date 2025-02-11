import React from 'react'
import { CollectionNames } from '../../hooks/useDatabaseQuery'

import AssetResultsItem from '../../components/asset-results-item'
import { Asset } from '../../modules/assets'
import Comment from '../comment'
import { FullComment } from '../../modules/comments'
import Link from '../link'
import { getUrlForParent } from '../../relations'

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
    case CollectionNames.Assets:
      return <Link to={getUrlForParent(type, id)}>{data.title}</Link>
    case CollectionNames.Comments:
      return (
        <Link to={getUrlForParent(type, id)}>{data.createdbyusername}</Link>
      )
    default:
      return <>Invalid type "{type}"</>
  }
}

export default GenericOutputLabel
