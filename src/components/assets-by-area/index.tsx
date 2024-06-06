import React, { Fragment } from 'react'
import { makeStyles } from '@material-ui/core'
import Link from '../../components/link'

import {
  areasByCategory,
  groupAssetsIntoAreas,
  standardAreaNames,
  standardAreas,
} from '../../areas'
import * as routes from '../../routes'

import AssetResults from '../asset-results'
import Heading from '../heading'
import { Asset, AssetCategory, PublicAsset } from '../../modules/assets'

const useStyles = makeStyles({
  tags: {
    fontSize: '50%',
  },
})

const AssetsByArea = ({
  assets,
  categoryName,
}: {
  assets?: PublicAsset[]
  categoryName: string
}) => {
  const classes = useStyles()

  if (!assets) {
    return null
  }

  const assetsByArea = groupAssetsIntoAreas(assets, categoryName)
  const areas = areasByCategory[categoryName as AssetCategory]

  return (
    <div>
      {Object.entries(assetsByArea)
        .filter(([, assets]) => assets.length)
        .map(([areaName, assets]) => (
          <Fragment key={areaName}>
            <Heading variant="h2">
              {areaName !== standardAreaNames.none ? (
                <Link
                  to={routes.viewAreaWithVar
                    .replace(':categoryName', categoryName)
                    .replace(':areaName', areaName)}>
                  {areaName in areas ? areas[areaName].namePlural : areaName}
                </Link>
              ) : areaName == standardAreaNames.none ? (
                standardAreas[standardAreaNames.none].namePlural
              ) : (
                areas[areaName].namePlural
              )}{' '}
              <span className={classes.tags}>
                {areaName in areas ? (
                  <>
                    {areas[areaName].tags.map((tag, idx) => (
                      <Fragment key={tag}>
                        {idx > 0 ? ', ' : ''}
                        <Link
                          to={routes.queryWithVar.replace(
                            ':query',
                            `category:${AssetCategory.Accessory} ${tag}`
                          )}>
                          {tag}
                        </Link>
                      </Fragment>
                    ))}
                  </>
                ) : (
                  ''
                )}
              </span>
            </Heading>
            <AssetResults assets={assets} />
          </Fragment>
        ))}
    </div>
  )
}

export default AssetsByArea
