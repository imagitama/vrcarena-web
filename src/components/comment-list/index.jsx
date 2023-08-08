import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Comment from '../comment'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import AddCommentForm from '../add-comment-form'
import useDataStore from '../../hooks/useDataStore'
import { client as supabase } from '../../supabase'
import { CommentFieldNames } from '../../hooks/useDatabaseQuery'
import useIsEditor from '../../hooks/useIsEditor'
import { getQueryParam } from '../../utils'
import { trackAction } from '../../analytics'
import { CollectionNames } from '../../modules/assets'
import WarningMessage from '../warning-message'

const useStyles = makeStyles({
  root: {}
})

export default ({
  collectionName,
  parentId,
  shimmer = false,
  className = '',
  getPrivate = false
}) => {
  const classes = useStyles()
  const isEditor = useIsEditor()
  const getQuery = useCallback(
    () =>
      shimmer
        ? false
        : supabase
            .from(
              (isEditor ? 'getFullComments' : 'getPublicComments').toLowerCase()
            )
            .select('*')
            .eq(CommentFieldNames.parentTable, collectionName)
            .eq(CommentFieldNames.parent, parentId)
            .eq(CommentFieldNames.isPrivate, getPrivate)
            .order(CommentFieldNames.createdAt, { ascending: false }),
    [collectionName, parentId, shimmer, isEditor, getPrivate]
  )

  const [isLoading, isErrored, results, , hydrate] = useDataStore(
    shimmer ? null : getQuery,
    'get-comments'
  )

  if (isLoading || shimmer) {
    return (
      <div className={`${classes.root} ${className}`}>
        <Comment shimmer />
        <Comment shimmer />
        <Comment shimmer />
      </div>
    )
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to load{getPrivate ? ' private' : ''} comments
      </ErrorMessage>
    )
  }

  const commentIdToScrollTo = getQueryParam('comment')

  return (
    <div className={`${classes.root} ${className}`}>
      <div className={classes.comments}>
        {results.length ? (
          results.map(result => (
            <Comment
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
      {collectionName === CollectionNames.Assets ? (
        <WarningMessage>
          If information about this asset is incorrect (eg. the source is
          broken) please create a report instead of commenting here. Staff do
          not monitor these comments.
        </WarningMessage>
      ) : null}
      <AddCommentForm
        collectionName={collectionName}
        parentId={parentId}
        asPrivate={getPrivate}
        onAddClick={() =>
          trackAction('CommentList', 'Click add comment button', {
            collectionName,
            parentId
          })
        }
        onDone={() => hydrate()}
      />
    </div>
  )
}
