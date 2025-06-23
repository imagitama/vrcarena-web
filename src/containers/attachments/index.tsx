import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import * as routes from '../../routes'
import PaginatedView from '../../components/paginated-view'
import { Attachment, CollectionNames } from '../../modules/attachments'
import AttachmentResults from '../../components/attachment-results'

const Renderer = ({ items }: { items?: Attachment[] }) => {
  return <AttachmentResults attachments={items || []} />
}

const NewAssetsView = () => {
  return (
    <>
      <Helmet>
        <title>View all attachments | VRCArena</title>
        <meta
          name="description"
          content="Here is a list of assets that have been posted on the site and recently approved."
        />
      </Helmet>
      <div>
        <Heading variant="h1">Attachments</Heading>
        <p>Attachments to assets.</p>
        <PaginatedView
          name="attachments"
          collectionName={CollectionNames.Attachments}
          urlWithPageNumberVar={routes.attachmentsWithPageNumberVar}>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}

export default NewAssetsView
