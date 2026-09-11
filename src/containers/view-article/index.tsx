import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import { useParams } from 'react-router'

import { FullArticle, ViewNames } from '@/modules/articles'

import useDataStoreItem from '@/hooks/useDataStoreItem'

import NoResultsMessage from '@/components/no-results-message'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import { trimDescription } from '@/utils/formatting'

const View = () => {
  const { articleId } = useParams<{ articleId: string }>()

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
