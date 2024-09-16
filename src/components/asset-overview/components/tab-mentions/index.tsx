import React, { useCallback, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useIsAdultContentEnabled from '../../../../hooks/useIsAdultContentEnabled'
import { client as supabase } from '../../../../supabase'
import TabContext from '../../context'
import PaginatedView from '../../../paginated-view'
import {
  AssetFieldNames,
  OrderDirections,
} from '../../../../hooks/useDatabaseQuery'
import { Asset } from '../../../../modules/assets'
import { RelationsItems, RelationItem } from '../../../relations'

const useStyles = makeStyles({
  item: { margin: '0.5rem' },
})

const Renderer = ({ items }: { items?: Asset[] }) => {
  const { assetId } = useContext(TabContext)
  const classes = useStyles()

  if (!items) {
    return null
  }

  return (
    <RelationsItems>
      {items.map((item) => {
        const relation = item.relations.find(
          (relation) => relation.asset === assetId
        )

        // can't throw here - some kind of race condition on navigation means entire asset page crashes

        return (
          <div key={item.id} className={classes.item}>
            {relation ? (
              <RelationItem
                relation={{
                  type: relation.type,
                  asset: relation.asset,
                  comments: '',
                }}
                asset={item}
                showRelation
              />
            ) : null}
          </div>
        )
      })}
    </RelationsItems>
  )
}

export default () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const { assetId } = useContext(TabContext)
  const getQuery = useCallback(() => {
    let query = supabase
      .rpc('getmentions', {
        assetid: assetId,
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
      <PaginatedView<Asset>
        collectionName="getmentions"
        getQuery={getQuery}
        defaultFieldName="createdat"
        defaultDirection={OrderDirections.DESC}>
        <Renderer />
      </PaginatedView>
    </div>
  )
}
