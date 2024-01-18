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
import {
  GetFullPlaylistFieldNames,
  PlaylistsFieldNames,
} from '../../data-store'
import AssetResults from '../../components/asset-results'
import useDataStoreItem from '../../hooks/useDataStoreItem'

const analyticsCategory = 'ViewDiscordServer'

const View = () => {
  const { collectionId } = useParams()
  const [isLoading, isErrored, result] = useDataStoreItem(
    'getfullplaylists',
    collectionId,
    'view-collection'
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get collection</ErrorMessage>
  }

  if (!result) {
    return <ErrorMessage>The collection does not exist</ErrorMessage>
  }

  const {
    id: playlistId,
    [PlaylistsFieldNames.title]: title,
    [PlaylistsFieldNames.description]: description,
    [GetFullPlaylistFieldNames.assets]: assets,
  } = result

  return (
    <>
      <Helmet>
        <title>View collection "{title}" | VRCArena</title>
        <meta name="description" content={description} />
      </Helmet>

      <Heading variant="h1">
        <Link
          to={routes.viewCollectionWithVar.replace(
            ':collectionId',
            playlistId
          )}>
          {title}
        </Link>
      </Heading>

      {description && <Markdown source={description} />}

      <AssetResults assets={assets} />

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
