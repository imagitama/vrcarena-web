import React from 'react'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'
import { ViewNames, SubEditorResponse } from '@/modules/subeditorresponses'

import Link from '@/components/link'
import Heading from '@/components/heading'
import BodyText from '@/components/body-text'
import PaginatedView from '@/components/paginated-view'
import SubEditorResults from '@/components/sub-editor-results'

const SubEditorResponses = () => {
  return (
    <>
      <Helmet>
        <title>View all community editor responses</title>
        <meta
          name="description"
          content="Browse the responses of community editors."
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.subEditorResponses}>Community Editor Responses</Link>
      </Heading>
      <BodyText>A list of all community editor responses</BodyText>
      <PaginatedView<SubEditorResponse>
        viewName={ViewNames.GetFullSubEditorResponses}
        name="sub-editor-responses"
        sortOptions={[
          {
            label: 'Created on',
            fieldName: 'createdat',
          },
        ]}
        defaultFieldName={'createdat'}
        urlWithSubViewNameAndPageNumberVar={
          routes.subEditorResponsesWithPageNumberVar
        }>
        {/* @ts-ignore */}
        <SubEditorResults />
      </PaginatedView>
    </>
  )
}

export default SubEditorResponses
