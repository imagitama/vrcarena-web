import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'

import { Species } from '../../modules/species'
import Link from '../../components/link'
import * as routes from '../../routes'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

const useStyles = makeStyles({
  root: {
    width: '200px',
    height: '100%',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
    },
    overflow: 'visible',
  },
})

const SpeciesResultItem = ({ species }: { species: Species }) => {
  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link to={routes.viewSpeciesWithVar.replace(':speciesId', species.id)}>
          <img src={species.thumbnailurl} />
          {species.pluralname}
        </Link>
      </CardActionArea>
    </Card>
  )
}

export default SpeciesResultItem
