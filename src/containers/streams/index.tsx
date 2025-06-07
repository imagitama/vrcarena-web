import React from 'react'
import { Helmet } from 'react-helmet'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import useDatabaseQuery, {
  Operators,
  options,
} from '../../hooks/useDatabaseQuery'
import { User } from '../../modules/users'
import Button from '../../components/button'
import { makeStyles } from '@material-ui/styles'
import { CollectionNames } from '../../modules/user'

const useStyles = makeStyles({
  item: {
    padding: '0.25rem',
    display: 'inline-block',
  },
})

const getTwitchUsernameFromUrl = (usernameOrUrl: string): string =>
  usernameOrUrl && usernameOrUrl.includes('twitch.tv/')
    ? usernameOrUrl.split('twitch.tv/').pop() || ''
    : usernameOrUrl

function Streams() {
  const classes = useStyles()
  const [isLoading, isError, users] = useDatabaseQuery<User>(
    CollectionNames.Users,
    [['twitchusername', Operators.GREATER_THAN, '']],
    {
      [options.queryName]: 'streams',
    }
  )

  if (isLoading || !users || !Array.isArray(users)) {
    return <LoadingIndicator message="Loading streams..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load steams</ErrorMessage>
  }

  return (
    <>
      {users.map((user) => {
        const twitchUsername = getTwitchUsernameFromUrl(user.twitchusername)
        console.log(twitchUsername)
        return (
          <div className={classes.item}>
            <Button url={`https://twitch.tv/${twitchUsername}`}>
              {twitchUsername}
            </Button>
          </div>
        )
      })}
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View Twitch streams | VRCArena</title>
      <meta
        name="description"
        content="Browse the list of Twitch streamers that are on the site."
      />
    </Helmet>
    <Heading variant="h1">Streams</Heading>
    <BodyText>
      A list of Twitch streams for the signed up users of the site.
    </BodyText>
    <Streams />
  </>
)
