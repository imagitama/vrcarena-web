import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import AssetResultsItem from '../asset-results-item'
import LoadingShimmer from '../loading-shimmer'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
  item: {
    margin: '0.5rem',
    [mediaQueryForTabletsOrBelow]: {
      margin: '0.25rem'
    }
  }
})

export default ({
  assets = [],
  showCategory = false,
  showPinned = false,
  showCost = true,
  showIsNsfw = true,
  hoverOnEffect = false,
  selectedAssetIds = [],
  showUnselected = false,
  onClickWithEventAndAsset = null,
  shimmer = false,
  showAddToCart = true
}) => {
  const classes = useStyles()
  let allAssets

  if (showPinned) {
    const { pinnedAssets, unpinnedAssets } = assets.reduce(
      ({ pinnedAssets, unpinnedAssets }, asset) => {
        if (asset.isPinned) {
          return {
            pinnedAssets: pinnedAssets.concat([asset]),
            unpinnedAssets
          }
        }
        return {
          pinnedAssets,
          unpinnedAssets: unpinnedAssets.concat([asset])
        }
      },
      { pinnedAssets: [], unpinnedAssets: [] }
    )

    allAssets = pinnedAssets.concat(unpinnedAssets)
  } else {
    allAssets = assets
  }

  return (
    <div className={classes.root}>
      {shimmer ? (
        <>
          <div className={classes.item}>
            <AssetResultsItem shimmer />
          </div>
          <div className={classes.item}>
            <AssetResultsItem shimmer />
          </div>
          <div className={classes.item}>
            <AssetResultsItem shimmer />
          </div>
        </>
      ) : (
        allAssets.map(asset => (
          <div key={asset.id} className={classes.item}>
            <AssetResultsItem
              asset={asset}
              showCategory={showCategory}
              showPinned={showPinned}
              showCost={showCost}
              showIsNsfw={showIsNsfw}
              hoverOnEffect={hoverOnEffect}
              isUnselected={
                showUnselected && !selectedAssetIds.includes(asset.id)
              }
              onClick={
                onClickWithEventAndAsset
                  ? e => onClickWithEventAndAsset(e, asset)
                  : null
              }
              showAddToCart={showAddToCart}
            />
          </div>
        ))
      )}
    </div>
  )
}
