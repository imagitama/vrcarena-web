import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LoadingIndicator from '../../../../components/loading-indicator'
import useDatabaseQuery, {
  OrderDirections,
} from '../../../../hooks/useDatabaseQuery'
import {
  CachedDiscordMessage,
  collectionNames,
  discordMessageCacheFieldNames,
} from '../../../../modules/discordmessagecache'
import FormattedDate from '../../../../components/formatted-date'
import { trimDescription } from '../../../../utils/formatting'
import Markdown from '../../../../components/markdown'

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  meta: {
    display: 'flex',
    alignItems: 'baseline',
    position: 'relative',
  },
  author: {
    color: '#FFF',
  },
  date: {
    width: '100%',
    fontSize: '60%',
    marginLeft: '0.25rem',
  },
  message: {
    color: '#C3C3C3',
    fontSize: '80%',
    '& :first-child': {
      marginTop: 0,
    },
  },
  channelName: {},
  fetchedat: {
    fontSize: '50%',
    opacity: '0.25',
    textAlign: 'right',
  },
  extradata: {},
})

const DefaultMessage = () => (
  <>
    Our Discord server is a way for you to get help with your avatar, provide
    feedback, report bugs and more.
  </>
)

export default () => {
  // TODO: Filter by channel
  const [isLoading, isError, messages] = useDatabaseQuery<CachedDiscordMessage>(
    collectionNames.discordMessageCache,
    [],
    1,
    [discordMessageCacheFieldNames.sentAt, OrderDirections.DESC]
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator message="Loading message..." />
  }

  if (isError || !Array.isArray(messages) || !messages.length) {
    return <DefaultMessage />
  }

  const message = messages[0]

  if (Array.isArray(message)) {
    return <DefaultMessage />
  }

  return (
    <div className={classes.root}>
      <div className={classes.meta}>
        <div className={classes.author}>{message.rawdata.author.username}</div>
        <div className={classes.date}>
          <FormattedDate date={message.sentat} />
        </div>
        <div className={classes.extradata}>
          <div className={classes.channelName}>#announcements</div>
          <div className={classes.fetchedat}>
            Fetched <FormattedDate date={message.cachedat} />
          </div>
        </div>
      </div>
      <div className={classes.message}>
        <Markdown source={trimDescription(message.content, 200)} />
      </div>
    </div>
  )
}
