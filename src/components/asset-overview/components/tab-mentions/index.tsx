import React, { useCallback, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useIsAdultContentEnabled from '../../../../hooks/useIsAdultContentEnabled'
import { client as supabase } from '../../../../supabase'
import TabContext from '../../context'
import PaginatedView from '../../../paginated-view'
import {
  AssetFieldNames,
  OrderDirections
} from '../../../../hooks/useDatabaseQuery'
import { PublicAsset } from '../../../../modules/assets'
import { Relations, RelationItem } from '../../../relations'

const useStyles = makeStyles({
  item: { margin: '0.5rem' }
})

const Renderer = ({ items }: { items?: PublicAsset[] }) => {
  const { assetId } = useContext(TabContext)
  const classes = useStyles()

  if (!items) {
    return null
  }

  return (
    <Relations>
      {items.map(item => {
        const relation = item.relations.find(
          relation => relation.asset === assetId
        )

        // can't throw here - some kind of race condition on navigation means entire asset page crashes

        return (
          <div key={item.id} className={classes.item}>
            {relation ? (
              <RelationItem
                relation={{
                  type: relation.type,
                  asset: relation.asset,
                  comments: ''
                }}
                asset={item}
                showRelation
              />
            ) : null}
          </div>
        )
      })}
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
