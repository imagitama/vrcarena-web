import React from 'react'

import { trackAction } from '../../analytics'
import { DiscordServerData } from '../../modules/assets'
import ErrorMessage from '../error-message'
import Box from '../box'
import { Discord as DiscordIcon } from '../../icons'
import { discordPurple } from '../../config'

export default ({
  discordServerId,
  discordServerData,
  analyticsCategoryName = undefined,
  className = undefined,
}: {
  discordServerId: string
  discordServerData?: DiscordServerData
  analyticsCategoryName?: string
  className?: string
}) => {
  return (
    <Box icon={<DiscordIcon />} color={discordPurple} className={className}>
      To visit this URL you must be a member of the Discord server "
      {discordServerData && discordServerData.name}"
      <br />
      {discordServerData && discordServerData.requirespatreon ? (
        <>
          You must be a Patreon:{' '}
          <a
            href={discordServerData.patreonurl}
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
      ) : discordServerData && discordServerData.inviteurl ? (
        <>
          You must accept this invite:{' '}
          <a
            href={discordServerData.inviteurl}
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
      ) : // assume it is being lazy-loaded in
      null}
    </Box>
  )
}
