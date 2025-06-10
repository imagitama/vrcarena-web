import React, { Fragment } from 'react'
import { makeStyles } from '@mui/styles'

import {
  areasByCategory,
  groupAssetsIntoAreas,
  standardAreaNames,
  standardAreas,
} from '../../areas'
import * as routes from '../../routes'
import { AssetCategory, PublicAsset } from '../../modules/assets'
import Link from '../../components/link'

import AssetResults from '../asset-results'
import Heading from '../heading'

const useStyles = makeStyles({
  tags: {
    fontSize: '50%',
  },
  areas: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '-1rem',
  },
  area: {
    margin: '1rem',
  },
})

const AssetsByArea = ({
  assets,
  categoryName,
  hydrate,
}: {
  assets?: PublicAsset[]
  categoryName: string
  hydrate?: () => void
}) => {
  const classes = useStyles()

  if (!assets) {
    return null
  }

  const assetsByArea = groupAssetsIntoAreas(assets, categoryName)
  const areas = areasByCategory[categoryName as AssetCategory]

  return (
    <div className={classes.areas}>
      {Object.entries(assetsByArea)
        .filter(([, assets]) => assets.length)
        .map(([areaName, assets]) => (
          <div key={areaName} className={classes.area}>
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
            <AssetResults assets={assets} hydrate={hydrate} />
          </div>
        ))}
    </div>
  )
}

export default AssetsByArea
