import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import AuthorResults from '../../components/author-results'

import * as routes from '../../routes'
import PaginatedView, { GetQueryFn } from '../../components/paginated-view'
import { Author, ViewNames } from '../../modules/authors'

enum SubView {
  DELETED = 'deleted',
  OPEN_FOR_COMMISSION = 'open-for-commission',
}

const Renderer = ({ items }: { items?: Author[] }) => (
  <AuthorResults authors={items || []} />
)

const AuthorsView = () => {
  const getQuery = useCallback<GetQueryFn<Author>>((query, selectedSubView) => {
    switch (selectedSubView) {
      case SubView.OPEN_FOR_COMMISSION:
        return query.is('isopenforcommission', true)
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
      <PaginatedView<Author>
        viewName={ViewNames.GetFullAuthors}
        editorViewName={ViewNames.GetFullAuthors}
        getQuery={getQuery}
        name="authors"
        sortOptions={[
          {
            label: 'Name',
            fieldName: 'name',
          },
          {
            label: 'Created on',
            fieldName: 'createdat',
          },
        ]}
        subViews={[
          {
            label: 'Open For Commission',
            id: SubView.OPEN_FOR_COMMISSION,
          },
        ]}
        defaultFieldName={'name'}
        urlWithPageNumberVar={routes.viewAuthorsWithPageNumberVar}
        createUrl={routes.createAuthor}>
        <Renderer />
      </PaginatedView>
    </>
  )
}

export default AuthorsView
