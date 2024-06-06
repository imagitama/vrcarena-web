import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'

import * as routes from '../../routes'

import Markdown from '../../components/markdown'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'
import Button from '../../components/button'
import PageControls from '../../components/page-controls'
import { trackAction } from '../../analytics'
import AssetResults from '../../components/asset-results'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { FullCollection, ViewNames } from '../../modules/collections'
import NoResultsMessage from '../../components/no-results-message'

const analyticsCategory = 'ViewDiscordServer'

const View = () => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const [isLoading, isErrored, result] = useDataStoreItem<FullCollection>(
    ViewNames.GetFullCollections,
    collectionId,
    'view-collection'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading collectiion..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load collection</ErrorMessage>
  }

  if (!result) {
    return <ErrorMessage>The collection does not exist</ErrorMessage>
  }

  const { id: playlistId, title, description, itemsassetdata } = result

  return (
    <>
      <Helmet>
        <title>{`View collection "${title}" | VRCArena`}</title>
        <meta
          name="description"
          content={`View the collection called ${title}: ${description}`}
        />
      </Helmet>

      <Heading variant="h1">
        Collection{' '}
        <Link
          to={routes.viewCollectionWithVar.replace(
            ':collectionId',
            playlistId
          )}>
          {title || '(no title)'}
        </Link>
      </Heading>

      {description && <Markdown source={description} />}

      {itemsassetdata.length ? (
        <AssetResults assets={itemsassetdata} />
      ) : (
        <NoResultsMessage>No assets in this collection</NoResultsMessage>
      )}

      <PageControls>
        <Button
          url={routes.viewCollections}
          color="default"
          onClick={() =>
            trackAction(analyticsCategory, 'Click view all collections button')
          }>
          View All Collections
        </Button>
      </PageControls>
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View a collection | VRCArena</title>
      <meta
        name="description"
        content="View more details about a collection."
      />
    </Helmet>
    <View />
  </>
)
