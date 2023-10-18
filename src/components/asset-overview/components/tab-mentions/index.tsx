import React, { useCallback, useContext } from 'react'
import useIsAdultContentEnabled from '../../../../hooks/useIsAdultContentEnabled'
import { client as supabase } from '../../../../supabase'
import TabContext from '../../context'
import PaginatedView from '../../../paginated-view'
import {
  AssetFieldNames,
  OrderDirections
} from '../../../../hooks/useDatabaseQuery'
import { PublicAsset, Relation } from '../../../../modules/assets'
import { Relations, RelationItem } from '../../../relations'

const Renderer = ({ items }: { items?: PublicAsset[] }) => {
  const { assetId } = useContext(TabContext)

  if (!items) {
    return null
  }

  return (
    <Relations>
      {items.map(item => (
        <RelationItem
          key={item.id}
          relation={
            item.relations.find(
              relation => relation.asset === assetId
            ) as Relation
          }
          asset={item}
          showRelation
        />
      ))}
    </Relations>
  )
}

export default () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const { assetId } = useContext(TabContext)
  const getQuery = useCallback(() => {
    let query = supabase
      .rpc('getmentions', {
        assetid: assetId
      })
      .select('*')

    query =
      isAdultContentEnabled === false
        ? query.is(AssetFieldNames.isAdult, false)
        : query

    return query
  }, [assetId, isAdultContentEnabled])

  return (
    <div>
      <PaginatedView
        collectionName="getmentions"
        getQuery={getQuery}
        defaultFieldName={AssetFieldNames.createdAt}
        defaultDirection={OrderDirections.DESC}>
        <Renderer />
      </PaginatedView>
    </div>
  )
}
