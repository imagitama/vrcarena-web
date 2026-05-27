import React from 'react'
import { makeStyles } from '@mui/styles'
import { mediaQueryForTabletsOrBelow } from '@/media-queries'
import AssetResultsItem from '@/components/asset-results-item'
import { Asset, AssetForList } from '@/modules/assets'

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
  selectedAssetIds = [],
  dimUnselected = false,
  onClickWithEventAndAsset = undefined,
  shimmer = false,
  shimmerCount = 3,
  showStates = false,
}: {
  assets?: (AssetForList | Asset)[]
  selectedAssetIds?: string[]
  dimUnselected?: boolean
  onClickWithEventAndAsset?: (
    event: React.SyntheticEvent<HTMLElement>,
    asset: AssetForList | Asset
  ) => void
  shimmer?: boolean
  shimmerCount?: number
  showStates?: boolean
}) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      {shimmer
        ? new Array(shimmerCount).fill(undefined).map((item, i) => (
            <div key={i} className={classes.item}>
              <AssetResultsItem />
            </div>
          ))
        : assets.map((asset) => (
            <div key={asset.id} className={classes.item}>
              <AssetResultsItem
                asset={asset}
                isSelected={selectedAssetIds.includes(asset.id)}
                isDimmed={
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
                showState={showStates}
              />
            </div>
          ))}
    </div>
  )
}

export default AssetResults
