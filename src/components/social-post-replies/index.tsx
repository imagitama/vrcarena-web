import React, { useCallback } from 'react'
import useSupabaseView, { GetQueryFn } from '../../hooks/useSupabaseView'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { PublicSocialPost, ViewNames } from '../../modules/social'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SocialPost from '../social-post'
import { GetQuery } from '../../data-store'

const SocialPostReplies = ({ postId }: { postId: string }) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback<GetQueryFn<PublicSocialPost>>(
    (query: GetQuery<PublicSocialPost>) => {
      query = query.eq('parent', postId)
      if (!isAdultContentEnabled) {
        query = query.eq('isadult', false)
      }
      return query.order('createdat', { ascending: false }).limit(50)
    },
    [isAdultContentEnabled]
  )
  const [isLoading, lastErrorCode, result, , hydrate] =
    useSupabaseView<PublicSocialPost>(ViewNames.GetPublicSocialPosts, getQuery)

  if (isLoading || !result) {
    return <LoadingIndicator message="Loading replies..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load replies (code {lastErrorCode})</ErrorMessage>
    )
  }

  return (
    <div>
      {result.map((socialPost) => (
        <SocialPost
          key={socialPost.id}
          socialPost={socialPost}
          hydrate={hydrate}
          allowReplies={false}
        />
      ))}
    </div>
  )
}

export default SocialPostReplies
