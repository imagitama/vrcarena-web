import React from 'react'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'
import { Author, ViewNames } from '@/modules/authors'

import Link from '@/components/link'
import Heading from '@/components/heading'
import BodyText from '@/components/body-text'
import AuthorResults from '@/components/author-results'
import PaginatedView from '@/components/paginated-view'

const Renderer = ({ items }: { items?: Author[] }) => (
  <AuthorResults authors={items || []} />
)

const AuthorsView = () => {
  return (
    <>
      <Helmet>
        <title>View all authors</title>
        <meta
          name="description"
          content="Browse the authors of assets on the site, created by our users."
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.authors}>Authors</Link>
      </Heading>
      <BodyText>A list of all authors who have assets on the site.</BodyText>
      <PaginatedView<Author>
        viewName={ViewNames.GetFullAuthors}
        editorViewName={ViewNames.GetFullAuthors}
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
        defaultFieldName={'name'}
        urlWithPageNumberVar={routes.viewAuthorsWithPageNumberVar}
        createUrl={routes.createAuthor}>
        <Renderer />
      </PaginatedView>
    </>
  )
}

export default AuthorsView
