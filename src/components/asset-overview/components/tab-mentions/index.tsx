import React, { useContext, useEffect } from 'react'
import { makeStyles } from '@mui/styles'

import { Asset } from '@/modules/assets'

import useIsAdultContentEnabled from '@/hooks/useIsAdultContentEnabled'
import useDataStoreFunction from '@/hooks/useDataStoreFunction'

import { RelationItem, RelationsItems } from '@/components/relations'
import LoadingIndicator from '@/components/loading-indicator'
import AssetResults from '@/components/asset-results'
import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'

import TabContext from '../../context'

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

enum FunctionNames {
  // TODO: only public assets
  GetMentions = 'getmentions',
}

export default () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const { assetId } = useContext(TabContext)
  const [isLoading, lastErrorCode, assets, callFunction] = useDataStoreFunction<
    { assetid: string; include_adult: boolean },
    Asset
  >(FunctionNames.GetMentions)

  useEffect(() => {
    callFunction({
      assetid: assetId,
      include_adult: isAdultContentEnabled,
    })
  }, [assetId])

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to load mentions: {lastErrorCode}</ErrorMessage>
  }

  if (isLoading || !assets) {
    return <LoadingIndicator message="Loading mentions..." />
  }

  if (!assets.length) {
    return <NoResultsMessage>No mentions found</NoResultsMessage>
  }

  return (
    <div>
      <AssetResults assets={assets} />
    </div>
  )
}
