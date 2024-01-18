import React from 'react'
import { Helmet } from 'react-helmet'

import Link from '../../components/link'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import { OrderDirections } from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import { PlaylistsFieldNames } from '../../data-store'
import CollectionResults from '../../components/collection-results'

const description = 'Browse the collections of assets created by our users.'

const Renderer = ({ items }) => <CollectionResults collections={items} />

export default () => {
  return (
    <>
      <Helmet>
        <title>View all collections | VRCArena</title>
        <meta name="description" content={description} />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.viewCollections}>All Collections</Link>
      </Heading>
      <BodyText>{description}</BodyText>
      <PaginatedView
        sortKey="view-all-collections"
        viewName="getPublicPlaylists"
        defaultFieldName={PlaylistsFieldNames.createdAt}
        defaultDirection={OrderDirections.ASC}
        urlWithPageNumberVar={routes.viewCollectionsWithPageNumberVar}>
        <Renderer />
      </PaginatedView>
    </>
  )
}
