import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import RefreshIcon from '@mui/icons-material/Refresh'
import { makeStyles } from '@mui/styles'

import Button from '../../components/button'
import CreateSocialPostForm from '../../components/create-social-post-form'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import SocialPost from '../../components/social-post'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import useSupabaseView, { GetQueryFn } from '../../hooks/useSupabaseView'
import { PublicSocialPost, ViewNames } from '../../modules/social'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import Center from '../../components/center'
import NoResultsMessage from '../../components/no-results-message'
import useTimer from '../../hooks/useTimer'

const useStyles = makeStyles({
  spinning: {
    animation: 'spinWheel 1s linear infinite',
  },
  '@keyframes spinWheel': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
})

export const SocialFeed = () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback<GetQueryFn<PublicSocialPost>>(
    (query) => {
      query = query.is('parent', null)
      if (!isAdultContentEnabled) {
        query = query.eq('isadult', false)
      }
      return query.order('createdat', { ascending: false }).limit(50)
    },
    [isAdultContentEnabled]
  )
  const [isLoading, lastErrorCode, result, , hydrate] =
    useSupabaseView<PublicSocialPost>(ViewNames.GetPublicSocialPosts, getQuery)
  const classes = useStyles()
  const isLoggedIn = useIsLoggedIn()

  const onCreate = () => hydrate()

  useTimer(() => hydrate(), 10000)

  return (
    <>
      {isLoggedIn && (
        <Center>
          <CreateSocialPostForm onDone={onCreate} />
        </Center>
      )}
      <Heading variant="h1">
        Social{' '}
        <RefreshIcon
          onClick={hydrate}
          className={isLoading ? classes.spinning : ''}
        />
      </Heading>
      {lastErrorCode !== null ? (
        <ErrorMessage>Failed to load posts (code {lastErrorCode})</ErrorMessage>
      ) : null}
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
      <br />
      <Button onClick={hydrate} icon={<RefreshIcon />}>
        Refresh
      </Button>
    </>
  )
}

export default () => {
  return (
    <>
      <Helmet>
        <title>Social | VRCArena</title>
        <meta
          name="description"
          content="Discover what our community is talking about right now through our social feed of posts and reactions."
        />
      </Helmet>
      <SocialFeed />
    </>
  )
}
