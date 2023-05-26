import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import AuthorResults from '../../components/author-results'

import { AuthorFieldNames } from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import PaginatedView from '../../components/paginated-view'

const subViews = {
  DELETED: 1,
  OPEN_FOR_COMMISSION: 2
}

const Renderer = ({ items }) => <AuthorResults authors={items} />

export default () => {
  const getQuery = useCallback((query, selectedSubView) => {
    switch (selectedSubView) {
      case subViews.OPEN_FOR_COMMISSION:
        return query.is(AuthorFieldNames.isOpenForCommission, true)
      default:
        return query
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>View all authors | VRCArena</title>
        <meta
          name="description"
          content="Browse all of the authors who have assets on the site."
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.authors}>Authors</Link>
      </Heading>
      <BodyText>A list of all authors who have assets on the site.</BodyText>
      <PaginatedView
        viewName="getPublicAuthors"
        editorViewName="getFullAuthors"
        getQuery={getQuery}
        sortKey="authors"
        sortOptions={[
          {
            label: 'Name',
            fieldName: AuthorFieldNames.name
          },
          {
            label: 'Created on',
            fieldName: AuthorFieldNames.createdAt
          }
        ]}
        subViews={[
          {
            label: 'Open For Commission',
            id: subViews.OPEN_FOR_COMMISSION
          }
        ]}
        defaultFieldName={AuthorFieldNames.name}
        urlWithPageNumberVar={routes.viewAuthorsWithPageNumberVar}
        createUrl={routes.createAuthor}
        showCommonMetaControls>
        <Renderer />
      </PaginatedView>
    </>
  )
}
