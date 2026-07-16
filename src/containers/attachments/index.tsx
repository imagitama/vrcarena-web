import React from 'react'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'
import { Attachment, CollectionNames, ViewNames } from '@/modules/attachments'

import Heading from '@/components/heading'
import PaginatedView from '@/components/paginated-view'
import AttachmentResults from '@/components/attachment-results'
import { OrderDirections } from '@/hooks/useDatabaseQuery'

const Renderer = ({ items }: { items?: Attachment[] }) => {
  return <AttachmentResults attachments={items || []} />
}

const NewAssetsView = () => {
  return (
    <>
      <Helmet>
        <title>View all attachments</title>
        <meta
          name="description"
          content="Here is a list of attachments that have been posted on the site and recently approved."
        />
      </Helmet>
      <div>
        <Heading variant="h1">Attachments</Heading>
        <p>Attached images, videos and files for assets and other records.</p>
        <PaginatedView
          name="attachments"
          viewName={ViewNames.GetAttachmentsForList}
          urlWithSubViewNameAndPageNumberVar={
            routes.attachmentsWithPageNumberVar
          }
          defaultDirection={OrderDirections.DESC}
          defaultFieldName="createdat">
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}

export default NewAssetsView
