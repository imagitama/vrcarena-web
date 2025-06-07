import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import AssetResultsItem from '../asset-results-item'
import { Asset, PublicAsset } from '../../modules/assets'
import InlineAssetEditor from '../inline-asset-editor'

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
  hydrate = undefined,
  showStates = false,
}: {
  assets?: (Asset | PublicAsset)[]
  selectedAssetIds?: string[]
  dimUnselected?: boolean
  onClickWithEventAndAsset?: (
    event: React.SyntheticEvent<HTMLElement>,
    asset: Asset | PublicAsset
  ) => void
  shimmer?: boolean
  shimmerCount?: number
  hydrate?: () => void
  showStates?: boolean
}) => {
  const classes = useStyles()
  const [assetIdToEdit, setAssetIdToEdit] = useState<null | string>(null)

  const toggleEditMode = (assetId: string) => {
    setAssetIdToEdit((currentAssetId) =>
      currentAssetId === assetId ? null : assetId
    )
    return false
  }

  return (
    <div className={classes.root}>
      {shimmer
        ? new Array(shimmerCount).fill(undefined).map(() => (
            <div className={classes.item}>
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
                toggleEditMode={
                  hydrate ? () => toggleEditMode(asset.id) : undefined
                }
                showState={showStates}
              />
            </div>
          ))}
      {assetIdToEdit && hydrate ? (
        <InlineAssetEditor
          asset={assets.find((asset) => asset.id === assetIdToEdit)!}
          onDone={hydrate}
          onCancel={() => setAssetIdToEdit(null)}
        />
      ) : null}
    </div>
  )
}

export default AssetResults
