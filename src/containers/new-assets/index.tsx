import React from 'react'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'
import { PublicAsset, ViewNames } from '@/modules/assets'

import Heading from '@/components/heading'
import AssetResults from '@/components/asset-results'
import AssetsPaginatedView from '@/components/assets-paginated-view'
import { OrderDirections } from '@/hooks/useDatabaseQuery'
import useStorage from '@/hooks/useStorage'
import Button from '@/components/button'
import FormControls from '@/components/form-controls'

const NewAssetsView = () => {
  const [isViewingAll, setIsViewingAll] = useStorage<boolean>(
    'new-assets-viewing-all',
    false
  )
  return (
    <>
      <Helmet>
        <title>Browse the newly approved assets posted on the site</title>
        <meta
          name="description"
          content="Here is a list of assets that have been posted on the site and recently approved."
        />
      </Helmet>
      <div>
        <Heading variant="h1">New Assets</Heading>
        <AssetsPaginatedView
          viewName={
            isViewingAll
              ? ViewNames.GetPublicAssets
              : ViewNames.GetNewPublicAssets
          }
          defaultFieldName="createdat"
          defaultDirection={OrderDirections.DESC}
          urlWithSubViewNameAndPageNumberVar={routes.newAssetsWithPageNumberVar}
          showDateMetadata
        />
        <FormControls>
          <Button
            onClick={() => setIsViewingAll(!isViewingAll)}
            checked={isViewingAll}>
            View All Assets
          </Button>
        </FormControls>
      </div>
    </>
  )
}

export default NewAssetsView
