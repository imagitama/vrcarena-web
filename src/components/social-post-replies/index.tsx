import React, { useCallback } from 'react'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import useSupabaseView from '../../hooks/useSupabaseView'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import { FullSocialPost } from '../../modules/social'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SocialPost from '../social-post'

const SocialPostReplies = ({ postId }: { postId: string }) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    (query: PostgrestFilterBuilder<FullSocialPost>) => {
      query = query.eq('parent', postId)
      if (!isAdultContentEnabled) {
        query = query.eq('isadult', false)
      }
      return query.order('createdat', { ascending: false }).limit(50)
    },
    [isAdultContentEnabled]
  )
  const [isLoading, isError, result, , hydrate] = useSupabaseView<
    FullSocialPost[]
  >('getpublicsocialposts', getQuery)

  if (isLoading || !result) {
    return <LoadingIndicator message="Loading replies..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load replies</ErrorMessage>
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
