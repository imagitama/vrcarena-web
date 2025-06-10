import React from 'react'
import { makeStyles } from '@mui/styles'

import { standardAreaNames, areasByCategory } from '../../areas'
import * as routes from '../../routes'
import Heading from '../heading'
import Link from '../link'

const useStyles = makeStyles({
  root: {
    marginTop: '1rem',
    display: 'flex',
  },
  items: {
    display: 'flex',
    marginLeft: '-0.5rem',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  item: {
    '& a': {
      padding: '0.5rem',
      fontSize: '125%',
    },
  },
})

export default ({
  categoryName,
  selectedAreaName = undefined,
}: {
  categoryName: string
  selectedAreaName?: string
}) => {
  const classes = useStyles()
  const areas = areasByCategory[categoryName]

  // handle Sentry issue where area is not found
  // TODO: just throw an error?
  if (!areas) {
    return null
  }

  return (
    <div className={classes.root}>
      <div className={classes.items}>
        {Object.entries(areas)
          .filter(([areaName]) => areaName !== standardAreaNames.none)
          .map(([areaName, areaDetails]) => {
            const ItemLink = () => (
              <Link
                to={routes.viewAreaWithVar
                  .replace(':categoryName', categoryName)
                  .replace(':areaName', areaName)}>
                {areaDetails.namePlural}
              </Link>
            )

            return (
              <div className={classes.item} key={areaName}>
                {areaName === selectedAreaName ? (
                  <Heading variant="h2" noMargin>
                    <ItemLink />
                  </Heading>
                ) : (
                  <ItemLink />
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
