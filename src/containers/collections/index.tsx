import React from 'react'
import { Helmet } from 'react-helmet'

import Link from '../../components/link'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import { OrderDirections } from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import ResultsItems from '../../components/results-items'
import { Collection, ViewNames } from '../../modules/collections'
import CollectionResultsItem from '../../components/collection-results-item'
import Button from '../../components/button'

const description = 'Browse the collections of assets created by our users.'

const Renderer = ({ items }: { items?: Collection[] }) => (
  <ResultsItems>
    {items!.map((item) => (
      <CollectionResultsItem key={item.id} collection={item} />
    ))}
  </ResultsItems>
)

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
      <PaginatedView<Collection>
        sortKey="view-all-collections"
        viewName={ViewNames.GetPublicCollections}
        defaultFieldName="createdat"
        defaultDirection={OrderDirections.ASC}
        urlWithPageNumberVar={routes.viewCollectionsWithPageNumberVar}
        extraControls={[
          <Button
            url={routes.myAccountWithTabNameVar.replace(
              ':tabName',
              'collection'
            )}>
            My Collections
          </Button>,
        ]}>
        <Renderer />
      </PaginatedView>
    </>
  )
}
