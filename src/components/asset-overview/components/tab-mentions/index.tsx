import React, { useCallback, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useIsAdultContentEnabled from '../../../../hooks/useIsAdultContentEnabled'
import TabContext from '../../context'
import PaginatedView from '../../../paginated-view'
import { OrderDirections } from '../../../../hooks/useDatabaseQuery'
import { Asset } from '../../../../modules/assets'
import { Relations, RelationItem } from '../../../relations'
import { GetQuery } from '../../../../data-store'
import { SupabaseClient } from '@supabase/supabase-js'

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
    <Relations>
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
    </Relations>
  )
}

export default () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const { assetId } = useContext(TabContext)
  const getQuery = useCallback(
    (supabase: SupabaseClient) => {
      const query = supabase
        .rpc('getmentions', {
          assetid: assetId,
          include_adult: isAdultContentEnabled,
        })
        .select<any, Asset>('*')

      return query
    },
    [assetId, isAdultContentEnabled]
  )

  return (
    <div>
      {/* @ts-ignore idk */}
      <PaginatedView<Asset>
        collectionName="getmentions"
        // @ts-ignore
        getQuery={getQuery}
        defaultFieldName="createdat"
        defaultDirection={OrderDirections.DESC}>
        <Renderer />
      </PaginatedView>
    </div>
  )
}
