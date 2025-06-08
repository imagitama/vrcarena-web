import React, { useCallback } from 'react'
import useIsAdultContentEnabled from '../../../../hooks/useIsAdultContentEnabled'
import useSupabaseView from '../../../../hooks/useSupabaseView'
import CommentList from '../../../comment-list'
import ErrorMessage from '../../../error-message'
import Heading from '../../../heading'
import NoResultsMessage from '../../../no-results-message'
import SocialPostItem from '../../../social-post'
import useUserOverview from '../../useUserOverview'
import { CollectionNames } from '../../../../modules/user'
import { PublicSocialPost, ViewNames } from '../../../../modules/social'

const SocialPosts = ({ userId }: { userId: string }) => {
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
  const [isLoading, isError, result, , hydrate] =
    useSupabaseView<PublicSocialPost>(ViewNames.GetPublicSocialPosts, getQuery)

  return (
    <>
      <Heading variant="h2">Social</Heading>
      {isError && <ErrorMessage>Failed to load posts</ErrorMessage>}
      <div>
        {result && result.length ? (
          result.map((socialPost) => (
            <SocialPostItem
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
