import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import AssetResultsItem from '../asset-results-item'
import { Asset } from '../../modules/assets'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
  item: {
    margin: '0.5rem',
    [mediaQueryForTabletsOrBelow]: {
      margin: '0.25rem',
    },
  },
})

const AssetResults = ({
  assets = [],
  showCategory = false,
  showCost = true,
  showIsNsfw = true,
  selectedAssetIds = [],
  dimUnselected = false,
  onClickWithEventAndAsset = undefined,
  shimmer = false,
  shimmerCount = 3,
  showAddToCart = true,
  showSelectedTick = false,
  showEditorChips = false,
}: {
  assets?: Asset[]
  showCategory?: boolean
  showCost?: boolean
  showIsNsfw?: boolean
  selectedAssetIds?: string[]
  dimUnselected?: boolean
  onClickWithEventAndAsset?: (
    event: React.SyntheticEvent<HTMLElement>,
    asset: Asset
  ) => void
  shimmer?: boolean
  shimmerCount?: number
  showAddToCart?: boolean
  showSelectedTick?: boolean
  showEditorChips?: boolean
}) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {shimmer
        ? new Array(shimmerCount).fill(undefined).map(() => (
            <div className={classes.item}>
              <AssetResultsItem shimmer />
            </div>
          ))
        : assets.map((asset) => (
            <div key={asset.id} className={classes.item}>
              <AssetResultsItem
                asset={asset}
                showCategory={showCategory}
                showCost={showCost}
                showIsNsfw={showIsNsfw}
                isSelected={selectedAssetIds.includes(asset.id)}
                dim={
                  dimUnselected &&
                  selectedAssetIds.length &&
                  !selectedAssetIds.includes(asset.id)
                    ? true
                    : false
                }
                onClick={
                  onClickWithEventAndAsset
                    ? (e: React.SyntheticEvent<HTMLElement>) =>
                        onClickWithEventAndAsset(e, asset)
                    : undefined
                }
                showAddToCart={showAddToCart}
                showSelectedTick={showSelectedTick}
                showEditorChips={showEditorChips}
              />
            </div>
          ))}
    </div>
  )
}

export default AssetResults
