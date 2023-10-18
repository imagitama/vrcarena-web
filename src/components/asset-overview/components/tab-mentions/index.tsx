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

        if (!relation) {
          throw new Error(
            `Could not find any relation matching asset ${assetId}`
          )
        }

        return (
          <div key={item.id} className={classes.item}>
            <RelationItem
              relation={{
                type: relation.type,
                asset: relation.asset,
                comments: ''
              }}
              asset={item}
              showRelation
            />
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
