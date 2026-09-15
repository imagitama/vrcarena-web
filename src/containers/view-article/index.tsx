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

const View = () => {
  const { articleId } = useParams<{ articleId: string }>()
  const isEditor = useIsEditor()

  const [isLoading, lastErrorCode, article, hydrate] =
    useDataStoreItem<FullArticle>(ViewNames.GetFullArticles, articleId, {
      queryName: 'view-article',
    })

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
      {isEditor ||
        (true && (
          <>
            <EditorRecordManager
              id={article.id}
              collectionName={CollectionNames.Articles}
              metaCollectionName={CollectionNames.ArticlesMeta}
              showAccessButtons
              showApprovalButtons
              showEditorNotes
              onDone={hydrate}
            />
          </>
        ))}
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
