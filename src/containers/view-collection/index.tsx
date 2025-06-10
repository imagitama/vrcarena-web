import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'
import EditIcon from '@mui/icons-material/Edit'

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
import UsernameLink from '../../components/username-link'
import useUserId from '../../hooks/useUserId'
import useIsEditor from '../../hooks/useIsEditor'
import { PublicAsset } from '../../modules/assets'

const analyticsCategory = 'ViewCollection'

const View = () => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const [isLoading, lastErrorCode, result] = useDataStoreItem<FullCollection>(
    ViewNames.GetFullCollections,
    collectionId,
    'view-collection'
  )
  const userId = useUserId()
  const isEditor = useIsEditor()

  if (isLoading) {
    return <LoadingIndicator message="Loading collectiion..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load collection (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!result) {
    return <ErrorMessage>The collection does not exist</ErrorMessage>
  }

  const {
    title,
    items,
    description,
    itemsassetdata,
    createdby,
    createdbyusername,
  } = result

  // @ts-ignore
  const validAssets: PublicAsset[] = (items || [])
    .map((item) => itemsassetdata.find((asset) => asset.id === item.asset))
    .filter((result) => result !== undefined)

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
            collectionId
          )}>
          {title || '(no title)'}
        </Link>
      </Heading>

      <Heading variant="h2" noTopMargin>
        by <UsernameLink username={createdbyusername} id={createdby} />
      </Heading>

      {description && <Markdown source={description} />}

      {validAssets.length ? (
        <AssetResults assets={validAssets} />
      ) : (
        <NoResultsMessage>No assets in this collection</NoResultsMessage>
      )}

      <PageControls>
        <Button
          url={routes.viewCollections}
          color="secondary"
          onClick={() =>
            trackAction(analyticsCategory, 'Click view all collections button')
          }>
          View All Collections
        </Button>{' '}
        {userId === createdby || isEditor ? (
          <Button
            url={routes.editCollectionWithVar.replace(
              ':collectionId',
              collectionId
            )}
            color="secondary"
            icon={<EditIcon />}>
            Edit
          </Button>
        ) : null}
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
