import React, { Fragment } from 'react'
import { makeStyles } from '@material-ui/core'
import Link from '../../components/link'

import {
  areasByCategory,
  groupAssetsIntoAreas,
  standardAreaNames,
  standardAreas
} from '../../areas'
import * as routes from '../../routes'

import AssetResults from '../asset-results'
import Heading from '../heading'

const useStyles = makeStyles({
  tags: {
    fontSize: '50%'
  }
})

export default ({ assets, categoryName }) => {
  const classes = useStyles()

  const assetsByArea = groupAssetsIntoAreas(assets, categoryName)
  const areas = areasByCategory[categoryName]

  return (
    <div className={classes.root}>
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
                {areaName in areas ? areas[areaName].tags.join(', ') : ''}
              </span>
            </Heading>
            <AssetResults assets={assets} showAddToCart />
          </Fragment>
        ))}
    </div>
  )
}
