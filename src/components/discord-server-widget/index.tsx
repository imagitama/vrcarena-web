import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
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
    marginBottom: '2rem',
  },
  members: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  member: {
    width: '50px',
    height: '50px',
    marginRight: '0.5rem',
    borderRadius: '100%',
    overflow: 'hidden',
    '& img': {
      width: '100%',
      height: '100%',
    },
  },
  onlineCount: {
    margin: '1rem 0',
  },
})

interface DiscordServerUser {
  id: string
  avatar_url: string
  username: string
}

interface DiscordServerWidgetData {
  name: string
  instant_invite: string
  members: DiscordServerUser[]
  presence_count: number
}

enum ErrorCode {
  InvalidWidgetId,
  WidgetNotEnabled,
  Unknown,
}

const getErrorMessageForErrorCode = (errorCode: ErrorCode): string => {
  switch (errorCode) {
    case ErrorCode.InvalidWidgetId:
      return 'invalid widget ID'
    case ErrorCode.WidgetNotEnabled:
      return 'server does not have widget enabled'
    default:
      return 'unknown'
  }
}

const DiscordServerWidget = ({
  serverId,
  joinActionCategory,
}: {
  serverId: string
  joinActionCategory: string
}) => {
  const [result, setResult] = useState<DiscordServerWidgetData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastErrorCode, setLastErrorCode] = useState<ErrorCode | null>(null)
  const classes = useStyles()

  const hydrate = async () => {
    try {
      console.debug(`Getting widget data for server ${serverId}...`)

      const resp = await fetch(
        `https://discordapp.com/api/guilds/${serverId}/widget.json`
      )

      if (!resp.ok) {
        const body = await resp.json()

        console.debug(`Response not OK. Body:`, { body })

        if (resp.status === 400 && body.guild_id) {
          setIsLoading(false)
          setLastErrorCode(ErrorCode.InvalidWidgetId)
          return
        }

        if (
          resp.status === 403 &&
          body.message &&
          body.message === 'Widget Disabled'
        ) {
          setIsLoading(false)
          setLastErrorCode(ErrorCode.WidgetNotEnabled)
          return
        }

        throw new Error(
          `Response not ok! Status ${resp.status} ${resp.statusText}`
        )
      }

      const data = await resp.json()

      console.debug(`Got data successfully!`, { data })

      setResult(data)
      setIsLoading(false)
      setLastErrorCode(null)
    } catch (err) {
      setLastErrorCode(ErrorCode.Unknown)
      setIsLoading(false)
      console.error(err)
      handleError(err)
    }
  }

  useEffect(() => {
    if (!serverId) {
      return
    }

    hydrate()
  }, [serverId])

  if (!serverId) {
    return null
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to get Discord widget:{' '}
        {getErrorMessageForErrorCode(lastErrorCode)}
      </ErrorMessage>
    )
  }

  if (isLoading || !result) {
    return <LoadingIndicator message="Loading widget..." />
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
            <img src={avatar_url} alt={`Avatar for ${username}`} />
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

export default DiscordServerWidget
