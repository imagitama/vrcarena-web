import React from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'

import * as routes from '../../routes'
import useDatabaseQuery, {
  SpeciesFieldNames,
  CollectionNames
} from '../../hooks/useDatabaseQuery'

import Link from '../../components/link'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem' },
  items: {
    display: 'flex',
    flexWrap: 'wrap',
    paddingLeft: '4rem'
  },
  item: {
    width: '200px',
    height: '200px',
    position: 'relative',
    margin: '0.5rem 0.5rem 0 -3rem',
    clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
    '& a': {
      width: '100%',
      height: '100%',
      display: 'inline'
    },
    '& img': {
      width: '100%'
    },
    transition: 'all 100ms',
    '&:hover': {
      transform: 'scale(1.2)',
      zIndex: 100,
      '& span': {
        opacity: 1
      }
    }
  },
  title: {
    width: '100%',
    position: 'absolute',
    bottom: '44%',
    right: '-30%',
    color: '#FFF',
    textShadow: '0 0 2px #000',
    opacity: 0,
    transition: 'all 100ms',
    transform: 'rotate(-76deg)',
    fontSize: '150%'
  }
})

const Species = ({ id, title, thumbnailUrl }) => {
  const classes = useStyles()
  const url = routes.viewSpeciesWithVar.replace(':speciesIdOrSlug', id)

  return (
    <div className={classes.item}>
      <Link to={url}>
        <span className={classes.title}>{title}</span>
        <img
          src={thumbnailUrl}
          alt={`Thumbnail for species ${title}`}
          className={classes.thumbnail}
        />
      </Link>
    </div>
  )
}

function sortSpeciesByAlpha([speciesNameA], [speciesNameB]) {
  return speciesNameA.localeCompare(speciesNameB)
}

const View = ({ onSpeciesClick = null }) => {
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Species
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError) {
    return <ErrorMessage />
  }

  const allSpeciesWithData = results.map(result => [
    result[SpeciesFieldNames.singularName],
    {
      id: result.id,
      isPopular: result[SpeciesFieldNames.isPopular],
      name: result[SpeciesFieldNames.singularName],
      shortDescription: result[SpeciesFieldNames.shortDescription],
      thumbnailUrl: result[SpeciesFieldNames.thumbnailUrl]
    }
  ])

  return (
    <div className={classes.root}>
      <div className={classes.items}>
        {allSpeciesWithData
          .sort(sortSpeciesByAlpha)
          .map(
            ([
              name,
              {
                id,
                name: title,
                shortDescription,
                thumbnailUrl,
                backupThumbnailUrl
              }
            ]) => (
              <Species
                key={id || name}
                id={id}
                name={name}
                title={title}
                description={shortDescription}
                thumbnailUrl={thumbnailUrl}
                onSpeciesClick={onSpeciesClick}
              />
            )
          )}
      </div>
    </div>
  )
}

export default props => (
  <>
    <Helmet>
      <title>VS Screen | VRCArena</title>
      <meta name="description" content="View the VS screen." />
    </Helmet>
    <View {...props} />
  </>
)
