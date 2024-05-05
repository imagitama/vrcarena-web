import React from 'react'
import { DiscordMessage as ReactDiscordMessage } from '@danktuary/react-discord-message'
import { CachedDiscordMessage } from '../../modules/discordmessagecache'
import { getAvatarImageUrl } from '../../discord'

const DiscordMessageResult = ({
  message,
}: {
  message: CachedDiscordMessage
}) => (
  <ReactDiscordMessage
    author={message.rawdata.author.username}
    avatar={
      message.rawdata.author.avatar
        ? getAvatarImageUrl(
            message.rawdata.author.id,
            message.rawdata.author.avatar
          )
        : undefined
    }
    timestamp={message.sentat}>
    {message.content}
  </ReactDiscordMessage>
)

export default DiscordMessageResult
