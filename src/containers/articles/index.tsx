import React from 'react'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'
import { ViewNames, FullArticle } from '@/modules/articles'

import PaginatedView from '@/components/paginated-view'
import Heading from '@/components/heading'
import BodyText from '@/components/body-text'
import { HydrateFn } from '@/hooks/useDataStore'
import ArticleResults from '@/components/article-results'
import { OrderDirections } from '@/hooks/useDatabaseQuery'

const Renderer = ({
  items,
  hydrate,
}: {
  items: FullArticle[]
  hydrate: HydrateFn
}) => <ArticleResults articles={items} hydrate={hydrate} />

const View = () => (
  <PaginatedView<FullArticle>
    viewName={ViewNames.GetFullArticles}
    name="articles"
    sortOptions={[
      {
        label: 'Created at',
        fieldName: 'createdat',
      },
    ]}
    defaultFieldName={'createdat'}
    defaultDirection={OrderDirections.DESC}
    urlWithSubViewNameAndPageNumberVar={routes.articlesWithPageNumberVar}
    createUrl={routes.createArticle}
    itemNamePlural="articles">
    {/* @ts-ignore */}
    <Renderer />
  </PaginatedView>
)

export default () => (
  <>
    <Helmet>
      <title>Articles</title>
      <meta
        name="description"
        content="Browse the news articles for the site, VR social games and VR hardware/software."
      />
    </Helmet>
    <Heading variant="h1">Articles</Heading>
    <BodyText>
      Browse the news articles for the site, VR social games and VR
      hardware/software.
    </BodyText>
    <View />
  </>
)
