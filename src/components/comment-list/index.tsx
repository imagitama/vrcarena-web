import React, { useCallback } from 'react'

import useDataStore from '../../hooks/useDataStore'
import useIsEditor from '../../hooks/useIsEditor'

import { getQueryParam } from '../../utils'
import { trackAction } from '../../analytics'
import { CollectionNames } from '../../modules/assets'
import { FullComment, ViewNames } from '../../modules/comments'

import CommentItem from '../comment'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import AddCommentForm from '../add-comment-form'
import WarningMessage from '../warning-message'
import { SupabaseClient } from '@supabase/supabase-js'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'

export default ({
  collectionName,
  parentId,
  shimmer = false,
  className = '',
  getPrivate = false,
}: {
  collectionName?: string
  parentId?: string
  shimmer?: boolean
  className?: string
  getPrivate?: boolean
}) => {
  const isEditor = useIsEditor()
  const getQuery = useCallback(
    (supabase: SupabaseClient) =>
      shimmer
        ? null
        : supabase
            .from(
              (isEditor
                ? ViewNames.GetFullComments
                : ViewNames.GetPublicComments
              ).toLowerCase()
            )
            .select('*')
            .eq('parenttable', collectionName)
            .eq('parent', parentId)
            .eq('isprivate', getPrivate)
            .order('createdat', { ascending: false }),
    [collectionName, parentId, shimmer, isEditor, getPrivate]
  )
  const isLoggedIn = useIsLoggedIn()

  const [isLoading, lastErrorCode, results, , hydrate] =
    useDataStore<FullComment>(shimmer ? null : getQuery, 'get-comments')

  if (isLoading || shimmer) {
    return (
      <div className={className}>
        <CommentItem shimmer />
        <CommentItem shimmer />
        <CommentItem shimmer />
      </div>
    )
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load{getPrivate ? ' private' : ''} comments
      </ErrorMessage>
    )
  }

  const commentIdToScrollTo = getQueryParam('comment')

  return (
    <div className={className}>
      <div>
        {results && results.length ? (
          results.map((result) => (
            <CommentItem
              key={result.id}
              comment={result}
              isHighlighted={commentIdToScrollTo === result.id}
              performScroll={commentIdToScrollTo === result.id}
              hydrate={hydrate}
            />
          ))
        ) : (
          <NoResultsMessage>
            No{getPrivate ? ' private' : ''} comments found
          </NoResultsMessage>
        )}
      </div>
      {collectionName === CollectionNames.Assets && isLoggedIn ? (
        <WarningMessage>
          If information about this asset is incorrect (eg. the source is
          broken) please create a report instead of commenting here. Staff do
          not monitor these comments.
        </WarningMessage>
      ) : null}
      {collectionName && parentId && (
        <AddCommentForm
          collectionName={collectionName}
          parentId={parentId}
          asPrivate={getPrivate}
          onAddClick={() =>
            trackAction('CommentList', 'Click add comment button', {
              collectionName,
              parentId,
            })
          }
          onDone={() => hydrate()}
        />
      )}
    </div>
  )
}
