import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { handleError } from '../../error-handling'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'
import Button from '../button'
import { trackAction } from '../../analytics'

// {
//   "id": "734993431507763289",
//   "name": "VRCArena",
//   "instant_invite": "https://discord.com/invite/WSeNK9",
//   "channels": [
//     { "id": "734993432082120738", "name": "General", "position": 0 }
//   ],
//   "members": [
//     {
//       "id": "0",
//       "username": "Angelcat2.0",
//       "discriminator": "0000",
//       "avatar": null,
//       "status": "dnd",
//       "avatar_url": "https://cdn.discordapp.com/widget-avatars/Yor9um3YBzVcG8zrKv5ESr23Yp69zj87X8QVsw_W5gI/GqnibszDlPUxYw8jbMlxT7Z5c3TXpcwRNo9YRVciiiLV46pxpSgxQRx9yu83OpV_rGOqVs_C1lNEwFNad1wACyiWbhINcabUHM0fhPl4lqZKlTWd0EO0gGT5-QtzrF4yLPcHRcRS66REXg"
//     }
//   ],
//   "presence_count": 12
// }

const useStyles = makeStyles({
  root: {
    marginBottom: '2rem'
  },
  members: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: '1rem'
  },
  member: {
    width: '50px',
    height: '50px',
    marginRight: '0.5rem',
    borderRadius: '100%',
    overflow: 'hidden',
    '& img': {
      width: '100%',
      height: '100%'
    }
  },
  onlineCount: {
    margin: '1rem 0'
  }
})

export default ({ serverId, joinActionCategory }) => {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isErrored, setIsErrored] = useState(false)
  const classes = useStyles()

  useEffect(() => {
    if (!serverId) {
      return
    }

    fetch(`https://discordapp.com/api/guilds/${serverId}/widget.json`)
      .then(resp => {
        if (!resp.ok) {
          throw new Error(
            `Response not ok! Status ${resp.status} ${resp.statusText}`
          )
        }
        return resp.json()
      })
      .then(json => {
        setResult(json)
        setIsLoading(false)
        setIsErrored(false)
      })
      .catch(err => {
        setIsErrored(true)
        setIsLoading(false)
        console.error(err)
        handleError(err)
      })
  }, [serverId])

  if (!serverId) {
    return null
  }

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to talk to Discord. Are you sure you have entered the correct
        server ID and enabled widgets?
      </ErrorMessage>
    )
  }

  const { name, instant_invite, members, presence_count } = result

  return (
    <div className={classes.root}>
      <Heading variant="h2">Discord Server: {name}</Heading>
      <Heading variant="h3" className={classes.onlineCount}>
        {presence_count} online
      </Heading>
      <div className={classes.members}>
        {members.map(({ id, avatar_url, username }) => (
          <div key={id} className={classes.member}>
            <img
              src={avatar_url}
              alt={`Avatar for ${username}`}
              className={classes.avatar}
            />
          </div>
        ))}
      </div>
      <Button
        url={instant_invite}
        onClick={() =>
          trackAction(joinActionCategory, 'Click join server button', serverId)
        }>
        Join Server
      </Button>
    </div>
  )
}
