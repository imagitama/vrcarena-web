import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import { useParams } from 'react-router'

import { routes } from '@/routes'
import { Article as ArticleIcon } from '@/icons'

import { CollectionNames, FullArticle, ViewNames } from '@/modules/articles'
import { trimDescription } from '@/utils/formatting'

import useDataStoreItem from '@/hooks/useDataStoreItem'
import useIsEditor from '@/hooks/useIsEditor'

import NoResultsMessage from '@/components/no-results-message'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import ArticleResultsItem from '@/components/article-results-item'
import EditorRecordManager from '@/components/editor-record-manager'
import FormControls from '@/components/form-controls'
import Button from '@/components/button'
import CommentList from '@/components/comment-list'
import Heading from '@/components/heading'
import { DataStoreErrorCode } from '@/data-store'
import { HydrateFn } from '@/hooks/useDataStore'
import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'
import { getIsUuid } from '@/utils'

const useSluggedArticle = (
  idOrSlug: string
): [
  boolean,
  DataStoreErrorCode | null,
  FullArticle | null | false,
  HydrateFn
] => {
  const isSlug = getIsUuid(idOrSlug) === false && idOrSlug.includes('-')

  const [isLoading, lastErrorCode, results, hydrate] =
    useDatabaseQuery<FullArticle>(
      ViewNames.GetFullArticles,
      [[isSlug ? 'slug' : 'id', Operators.EQUALS, idOrSlug]],
      { queryName: `view-article-${idOrSlug}` }
    )

  const result = Array.isArray(results)
    ? results.length === 1
      ? results[0]
      : false
    : null

  return [isLoading, lastErrorCode, result, hydrate]
}

const View = () => {
  const { articleId } = useParams<{ articleId: string }>()
  const isEditor = useIsEditor()

  const [isLoading, lastErrorCode, article, hydrate] =
    useSluggedArticle(articleId)

  if (isLoading) {
    return <LoadingIndicator message="Loading article..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to load article
      </ErrorMessage>
    )
  }

  if (!article) {
    return <NoResultsMessage>Article not found</NoResultsMessage>
  }

  const { title, content } = article

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={trimDescription(content)} />
      </Helmet>
      <ArticleResultsItem article={article} hydrate={hydrate} />
      <Heading variant="h2">Comments</Heading>
      <CommentList
        collectionName={CollectionNames.Articles}
        parentId={article.id}
      />
      <FormControls>
        <Button url={routes.articles} size="large" icon={<ArticleIcon />}>
          View All Articles
        </Button>
      </FormControls>
      {isEditor || (
        <EditorRecordManager
          id={article.id}
          collectionName={CollectionNames.Articles}
          metaCollectionName={CollectionNames.ArticlesMeta}
          showAccessButtons
          showApprovalButtons
          showEditorNotes
          onDone={hydrate}
        />
      )}
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View an article</title>
      <meta name="description" content="Read an article posted to the site." />
    </Helmet>
    <View />
  </>
)
