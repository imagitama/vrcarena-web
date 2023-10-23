import React from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import Button from '../../components/button'

import { trackAction } from '../../analytics'
import useIsEditor from '../../hooks/useIsEditor'
import useDatabaseQuery, {
  CollectionNames,
  options,
  OrderDirections,
  SpeciesFieldNames
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import { Species } from '../../modules/species'

const description =
  'Avatars in VR social games can be grouped into different species. Here is a list of all species that we know about in VR social games from Avalis to Dutch Angel Dragons to Digimon.'
const analyticsCategory = 'ViewAllSpecies'

const useStyles = makeStyles(theme => ({
  speciesItem: {
    marginBottom: '0.5rem',
    '& a': {
      color: 'inherit'
    }
  },
  speciesItemTitle: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      width: '100px',
      height: '100px',
      marginRight: '0.5rem'
    }
  },
  name: {
    fontSize: '150%',
    marginBottom: '0.1rem'
  },
  description: {
    fontSize: '75%',
    fontStyle: 'italic'
  }
}))

interface SpeciesWithChildren extends Species {
  children?: SpeciesWithChildren[]
}

function convertToNestedArray(
  arr: Species[],
  parentId: string | null = null
): SpeciesWithChildren[] {
  const nestedArray: SpeciesWithChildren[] = []
  for (const item of arr) {
    console.log('check', item.parent, parentId)
    if (item.parent === parentId) {
      console.debug(`parent ${item.parent} is equal to ${parentId}`)
      const children = convertToNestedArray(arr, item.id)
      if (children.length) {
        ;(item as SpeciesWithChildren).children = children
      }
      nestedArray.push(item as SpeciesWithChildren)
    }
  }
  return nestedArray
}

const SpeciesOutput = ({
  speciesItem,
  indent = 0
}: {
  speciesItem: SpeciesWithChildren
  indent?: number
}) => {
  const classes = useStyles()
  return (
    <div
      className={classes.speciesItem}
      style={{ marginLeft: `calc(2rem * ${indent})` }}>
      <Link
        to={routes.viewSpeciesWithVar.replace(
          ':speciesIdOrSlug',
          speciesItem.slug || speciesItem.id
        )}>
        <div className={classes.speciesItemTitle}>
          <img src={speciesItem.thumbnailurl} />{' '}
          <div>
            <div className={classes.name}>{speciesItem.pluralname}</div>
            <div className={classes.description}>
              {speciesItem.shortdescription}
            </div>
          </div>
        </div>
      </Link>
      {speciesItem.children
        ? speciesItem.children.map(speciesChild => (
            <SpeciesOutput speciesItem={speciesChild} indent={1} />
          ))
        : null}
    </div>
  )
}

const AllSpeciesOutput = () => {
  const [isLoading, isError, species] = useDatabaseQuery<Species>(
    CollectionNames.Species,
    [],
    {
      [options.orderBy]: [SpeciesFieldNames.singularName, OrderDirections.ASC]
    }
  )

  if (isLoading || !Array.isArray(species)) {
    return <LoadingIndicator message="Loading species..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  const speciesHierarchy = convertToNestedArray(species)

  return (
    <div>
      {speciesHierarchy.map(speciesItem => (
        <SpeciesOutput key={speciesItem.id} speciesItem={speciesItem} />
      ))}
    </div>
  )
}

export default () => {
  const isEditor = useIsEditor()
  return (
    <>
      <Helmet>
        <title>View all species | VRCArena</title>
        <meta name="description" content={description} />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.viewAllSpecies}>All Species</Link>
      </Heading>
      <BodyText>{description}</BodyText>
      {isEditor && (
        <>
          <Heading variant="h2">Actions</Heading>
          <Button
            url={routes.createSpecies}
            icon={<AddIcon />}
            onClick={() =>
              trackAction(analyticsCategory, 'Click create species button')
            }>
            Create
          </Button>
        </>
      )}
      <AllSpeciesOutput />
    </>
  )
}
