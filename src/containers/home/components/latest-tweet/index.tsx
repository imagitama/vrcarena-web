import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LoadingIndicator from '../../../../components/loading-indicator'
import useDatabaseQuery, {
  OrderDirections
} from '../../../../hooks/useDatabaseQuery'
import {
  CachedTweet,
  collectionNames,
  tweetCacheFieldNames
} from '../../../../modules/tweetcache'
import FormattedDate from '../../../../components/formatted-date'
import { trimDescription } from '../../../../utils/formatting'
import Markdown from '../../../../components/markdown'
import { TWITTER_URL } from '../../../../config'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    '& > a': {
      display: 'block',
      borderRadius: '0.5rem',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }
    }
  },
  meta: {
    display: 'flex',
    alignItems: 'baseline',
    position: 'relative'
  },
  author: {
    color: '#FFF'
  },
  date: {
    width: '100%',
    fontSize: '60%',
    marginLeft: '0.25rem'
  },
  message: {
    color: '#C3C3C3',
    fontSize: '80%',
    '& :first-child': {
      marginTop: 0
    }
  },
  channelName: {},
  fetchedat: {
    fontSize: '50%',
    opacity: '0.25',
    textAlign: 'right',
    whiteSpace: 'nowrap'
  },
  extradata: {}
})

const DefaultMessage = () => (
  <>
    The site automatically tweets about any new asset that is approved. We also
    use it for site updates including bug fixes, new features and if it ever
    goes down.
  </>
)

export default () => {
  const [isLoading, isError, tweets] = useDatabaseQuery<CachedTweet[]>(
    collectionNames.tweetCache,
    [],
    1,
    [tweetCacheFieldNames.tweetedAt, OrderDirections.DESC]
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator message="Loading tweet..." />
  }

  if (isError || !Array.isArray(tweets) || !tweets.length) {
    return <DefaultMessage />
  }

  const lastTweet = tweets[0]

  if (Array.isArray(lastTweet)) {
    return <DefaultMessage />
  }

  return (
    <div className={classes.root}>
      <a href={`${TWITTER_URL}/status/${lastTweet.id}`}>
        <div className={classes.meta}>
          <div className={classes.author}>
            <a href={TWITTER_URL}>@VRCArena</a>
          </div>
          <div className={classes.date}>
            <FormattedDate date={lastTweet.tweetedat} />
          </div>
          <div className={classes.extradata}>
            <div className={classes.fetchedat}>
              Fetched <FormattedDate date={lastTweet.cachedat} />
            </div>
          </div>
        </div>
        <div className={classes.message}>{lastTweet.text}</div>
      </a>
    </div>
  )
}
