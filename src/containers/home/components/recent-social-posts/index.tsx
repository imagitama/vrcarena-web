import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LoadingShimmer from '../../../../components/loading-shimmer'
import useSupabaseView from '../../../../hooks/useSupabaseView'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import useIsAdultContentEnabled from '../../../../hooks/useIsAdultContentEnabled'
import { FullSocialPost } from '../../../../modules/social'
import SocialPost from '../../../../components/social-post'

const useStyles = makeStyles({
  items: {},
  item: {
    marginBottom: '0.25rem',
  },
  date: {
    fontSize: '75%',
    marginLeft: '0.5rem',
  },
})

export default () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    (query: PostgrestFilterBuilder<FullSocialPost>) => {
      if (!isAdultContentEnabled) {
        query = query.eq('isadult', false)
      }
      return query.order('createdat', { ascending: false }).limit(3)
    },
    [isAdultContentEnabled]
  )
  const [isLoading, isError, socialPosts, , hydrate] = useSupabaseView<
    FullSocialPost[]
  >('getpublicsocialposts', getQuery)
  const classes = useStyles()

  if (isLoading) {
    return <LoadingShimmer height="20px" />
  }

  if (isError || !Array.isArray(socialPosts)) {
    return null
  }

  return (
    <div className={classes.items}>
      {socialPosts.map((socialPost) => (
        <SocialPost
          key={socialPost.id}
          socialPost={socialPost}
          small
          hydrate={hydrate}
        />
      ))}
    </div>
  )
}
