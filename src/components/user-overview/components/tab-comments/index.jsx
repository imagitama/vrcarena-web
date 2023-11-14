import React, { useCallback } from 'react'
import { CollectionNames } from '../../../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../../../hooks/useIsAdultContentEnabled'
import useSupabaseView from '../../../../hooks/useSupabaseView'
import CommentList from '../../../comment-list'
import ErrorMessage from '../../../error-message'
import Heading from '../../../heading'
import NoResultsMessage from '../../../no-results-message'
import SocialPost from '../../../social-post'
import useUserOverview from '../../useUserOverview'

const SocialPosts = ({ userId }) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    (query) => {
      query = query.eq('createdby', userId)
      if (!isAdultContentEnabled) {
        query = query.eq('isadult', false)
      }
      return query.order('createdat', { ascending: false }).limit(5)
    },
    [isAdultContentEnabled]
  )
  const [isLoading, isError, result, , hydrate] = useSupabaseView(
    'getpublicsocialposts',
    getQuery
  )

  return (
    <>
      <Heading variant="h2">Social</Heading>
      {isError && <ErrorMessage>Failed to load posts</ErrorMessage>}
      <div>
        {result && result.length ? (
          result.map((socialPost) => (
            <SocialPost
              key={socialPost.id}
              socialPost={socialPost}
              hydrate={hydrate}
            />
          ))
        ) : !isLoading ? (
          <NoResultsMessage>No posts found</NoResultsMessage>
        ) : null}
      </div>
    </>
  )
}

export default () => {
  const { userId, user } = useUserOverview()

  if (!userId || !user) {
    return null
  }

  return (
    <div>
      <SocialPosts userId={userId} />
      <Heading variant="h2">Comments</Heading>
      <CommentList collectionName={CollectionNames.Users} parentId={userId} />
    </div>
  )
}
