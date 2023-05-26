import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'
import Link from '../../components/link'

import useDatabaseQuery, {
  SpeciesFieldNames,
  CollectionNames,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import { fixAccessingImagesUsingToken } from '../../utils'
import * as routes from '../../routes'
import { Species } from '../../modules/species'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem' },
  items: {
    display: 'flex',
    flexWrap: 'wrap',
    paddingLeft: '4rem'
  },
  item: {
    width: '100px',
    height: '100px',
    position: 'relative',
    margin: '0.5rem 0.5rem 0 -1.5rem',
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
      cursor: 'pointer',
      transform: 'scale(1.2)',
      zIndex: 100,
      '& span': {
        opacity: 1
      }
    },
    opacity: 1
  },
  title: {
    width: '100%',
    position: 'absolute',
    bottom: '44%',
    right: '-30%',
    color: '#FFF',
    textShadow: '1px 1px 1px #000',
    transition: 'all 100ms',
    transform: 'rotate(-76deg)',
    fontSize: '75%'
  },
  horizontalTitles: {
    '& $title': {
      width: '70%',
      transform: 'rotate(0deg)',
      left: '6%',
      right: 'auto',
      bottom: 0
    }
  },
  selectedIcon: {
    background: 'rgb(255, 255, 0)',
    color: '#000',
    borderRadius: '100%',
    padding: '0.5rem',
    position: 'absolute',
    top: '4px',
    left: '25px',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  unselected: {
    opacity: '0.4',
    '&:hover': {
      opacity: 1
    }
  }
})

const Wrapper = ({
  onClickWithId,
  id,
  children,
  isSelected,
  showUnselected
}: {
  onClickWithId?: (id: string) => void
  id: string
  children: (React.ReactChild | null)[]
  isSelected: boolean
  showUnselected: boolean
}) => {
  const classes = useStyles()

  if (onClickWithId) {
    return (
      <div
        className={`${classes.item} ${
          showUnselected && !isSelected ? classes.unselected : ''
        }`}
        onClick={() => onClickWithId(id)}>
        {children}
      </div>
    )
  } else {
    return (
      <Link
        className={`${classes.item}  ${
          showUnselected && !isSelected ? classes.unselected : ''
        }`}
        to={routes.viewSpeciesWithVar.replace(':speciesIdOrSlug', id)}>
        {children}
      </Link>
    )
  }
}

const SpeciesTile = ({
  id,
  title,
  thumbnailUrl,
  onClickWithId,
  isSelected = false,
  showUnselected = false
}: {
  onClickWithId?: (id: string) => void
  id: string
  thumbnailUrl: string
  title: string
  isSelected: boolean
  showUnselected: boolean
}) => {
  const classes = useStyles()

  return (
    <Wrapper
      id={id}
      onClickWithId={onClickWithId}
      isSelected={isSelected}
      showUnselected={showUnselected}>
      <span className={classes.title}>{title}</span>
      <img
        src={fixAccessingImagesUsingToken(thumbnailUrl)}
        alt={`Thumbnail for species ${title}`}
      />
      {!showUnselected && isSelected ? (
        <div className={classes.selectedIcon}>
          <CheckIcon />
        </div>
      ) : null}
    </Wrapper>
  )
}

export default ({
  species = undefined,
  selectedSpeciesIds = [],
  showUnselected = false,
  onSpeciesClickWithId = undefined,
  horizontalTitles = false
}: {
  species?: Species[]
  selectedSpeciesIds?: string[]
  showUnselected?: boolean
  onSpeciesClickWithId?: (id: string) => void
  horizontalTitles?: boolean
}) => {
  const [isLoading, isError, allSpecies] = useDatabaseQuery<Species>(
    CollectionNames.Species,
    species ? false : [],
    9999,
    [SpeciesFieldNames.singularName, OrderDirections.ASC]
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError || !Array.isArray(allSpecies)) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  return (
    <div
      className={`${classes.root} ${
        horizontalTitles ? classes.horizontalTitles : ''
      }`}>
      <div className={classes.items}>
        {allSpecies.map(speciesItem => (
          <SpeciesTile
            key={speciesItem.id}
            id={speciesItem.id}
            title={speciesItem.singularname}
            thumbnailUrl={speciesItem.thumbnailurl}
            onClickWithId={
              onSpeciesClickWithId
                ? () => onSpeciesClickWithId(speciesItem.id)
                : undefined
            }
            isSelected={selectedSpeciesIds.includes(speciesItem.id)}
            showUnselected={showUnselected}
          />
        ))}
      </div>
    </div>
  )
}
