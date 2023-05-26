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
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow
} from '../../media-queries'
import useDatabaseQuery, {
  CollectionNames,
  options,
  OrderDirections,
  SpeciesFieldNames
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Message from '../../components/message'

const description =
  'Avatars in VR social games can be grouped into different species. Here is a list of all species that we know about in VR social games from Avalis to Dutch Angel Dragons to Digimon.'
const analyticsCategory = 'ViewAllSpecies'

const useStyles = makeStyles(theme => ({
  items: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  item: {
    padding: '1rem',
    width: '20%',
    textAlign: 'center',
    [mediaQueryForTabletsOrBelow]: {
      width: '33.3%'
    },
    [mediaQueryForMobiles]: {
      width: '50%'
    }
  },
  thumb: {
    width: '50%',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    }
  },
  name: {
    marginTop: '0.5rem',
    fontSize: '150%',
    textAlign: 'center'
  },
  description: {
    marginTop: '0.5rem',
    color: '#FFF'
  }
}))

const Species = () => {
  const [isLoading, isError, species] = useDatabaseQuery(
    CollectionNames.Species,
    [],
    {
      [options.orderBy]: [SpeciesFieldNames.singularName, OrderDirections.ASC]
    }
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading species..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  return <Results items={species} />
}

const Results = ({ items }) => {
  const classes = useStyles()
  return (
    <div className={classes.items}>
      {items.map(item => (
        <div key={item.id} className={classes.item}>
          <Link
            to={routes.viewSpeciesWithVar.replace(
              ':speciesIdOrSlug',
              item[SpeciesFieldNames.slug] || item.id
            )}>
            <img
              src={item[SpeciesFieldNames.thumbnailUrl]}
              alt="Species thumbnail"
              className={classes.thumb}
            />
            <div className={classes.name}>
              {item[SpeciesFieldNames.pluralName]}
            </div>
            <div className={classes.description}>
              {item[SpeciesFieldNames.shortDescription]}
            </div>
          </Link>
        </div>
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
      <Species />
      <Message>
        <Heading variant="h2" noTopMargin>
          How do we decide on a species?
        </Heading>
        <p>
          Species are decided by our editorial team on a case-by-case basis. We
          generally create a new species when any of these criteria are met:
        </p>
        <ul>
          <li>it has at least 2 avatar base models from different authors</li>
          <li>
            it is popular enough (eg. the Shiba Inu avatar from Pikapetey even
            though there is a Dog).
          </li>
          <li>
            it makes "sense" to create it instead of using an existing one
          </li>
        </ul>
        <p>
          You can request a new species or modification of an existing one
          (including a better artwork or wording changes) in our Discord server.
        </p>
      </Message>
    </>
  )
}
