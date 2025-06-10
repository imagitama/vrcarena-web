import React from 'react'
import { makeStyles } from '@mui/styles'

import { trackAction } from '../../analytics'
import { DiscordServer } from '../../modules/discordservers'

const useStyles = makeStyles({
  root: {
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    padding: '0.5rem',
  },
})

const DiscordServerInfo = ({
  discordServer,
  analyticsCategoryName = undefined,
}: {
  discordServer: DiscordServer
  analyticsCategoryName?: string
}) => {
  const classes = useStyles()

  if (!discordServer) {
    return null
  }

  const {
    id: discordServerId,
    name,
    inviteurl: inviteUrl,
    requirespatreon: requiresPatreon,
    patreonurl: patreonUrl,
  } = discordServer

  return (
    <div className={classes.root}>
      To download this asset you must be a member of Discord server "{name}"
      <br />
      {requiresPatreon ? (
        <>
          You must be a Patreon:{' '}
          <a
            href={patreonUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              analyticsCategoryName &&
              trackAction(
                analyticsCategoryName,
                'Click join Patreon link for Discord server',
                discordServerId
              )
            }>
            Join Here
          </a>
        </>
      ) : inviteUrl ? (
        <>
          You must accept this invite:{' '}
          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              analyticsCategoryName &&
              trackAction(
                analyticsCategoryName,
                'Click join Discord server link',
                discordServerId
              )
            }>
            Join Here
          </a>
        </>
      ) : (
        inviteUrl
      )}
    </div>
  )
}

export default DiscordServerInfo
