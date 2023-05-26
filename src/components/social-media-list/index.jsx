import React from 'react'
import TwitterIcon from '@material-ui/icons/Twitter'
import TelegramIcon from '@material-ui/icons/Telegram'
import YouTubeIcon from '@material-ui/icons/YouTube'
import EmailIcon from '@material-ui/icons/Email'
import LanguageIcon from '@material-ui/icons/Language'
import { makeStyles } from '@material-ui/core/styles'

import { ReactComponent as DiscordIcon } from '../../assets/images/icons/discord.svg'
import { ReactComponent as VrChatIcon } from '../../assets/images/icons/vrchat.svg'
import { ReactComponent as TwitchIcon } from '../../assets/images/icons/twitch.svg'
import { ReactComponent as GumroadIcon } from '../../assets/images/icons/gumroad.svg'
import { ReactComponent as PatreonIcon } from '../../assets/images/icons/patreon.svg'
import { ReactComponent as BoothIcon } from '../../assets/images/icons/booth.svg'

import {
  getUrlForVrChatUserId,
  getUrlForTwitterUsername,
  getUrlForTelegramUsername,
  getUrlForYouTubeChannelByChannelId,
  getUrlForTwitchByUsername,
  getUrlForGumroadUsername,
  getUrlForPatreonByUsername,
  getUrlForBoothByUsername
} from '../../social-media'
import { trackAction } from '../../analytics'

export const socialMediaType = {
  twitter: 'twitter',
  discord: 'discord',
  website: 'website',
  gumroad: 'gumroad'
}

const useStyles = makeStyles({
  items: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  item: {
    display: 'inline-block',
    padding: '0.5rem'
  },
  notUrl: {
    cursor: 'default'
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  iconWrapper: {
    width: '2rem',
    marginRight: '0.5rem',
    textAlign: 'right'
  },
  icon: {
    verticalAlign: 'middle',
    width: '1em',
    height: '1em'
  },
  vrchatIcon: {
    fontSize: '200%'
  },
  boothIcon: {
    fontSize: '150%',
    '& path': {
      fill: 'currentColor'
    }
  }
})

function SocialMediaListItem({
  actionCategory,
  item: { type, icon: Icon, iconClass, url, label }
}) {
  const classes = useStyles()

  if (!label) {
    return null
  }

  const FinalIcon = () => (
    <div className={classes.wrapper}>
      <div className={classes.iconWrapper}>
        <Icon className={`${classes.icon} ${iconClass || ''}`} />
      </div>
      <div>{label}</div>
    </div>
  )

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={classes.item}
        onClick={() =>
          trackAction(actionCategory, `Click "${type}" social media button`)
        }>
        <FinalIcon />
      </a>
    )
  }

  return (
    <span className={`${classes.item} ${classes.notUrl}`}>
      <FinalIcon />
    </span>
  )
}

export default ({
  actionCategory,
  socialMedia: {
    websiteUrl,
    email,
    gumroadUsername,
    vrchatUsername,
    vrchatUserId,
    chilloutVrUsername,
    neosVrUsername,
    discordUsername,
    twitterUsername,
    telegramUsername,
    youtubeChannelId,
    twitchUsername,
    patreonUsername,
    discordServerInviteUrl,
    boothUsername
  }
}) => {
  const classes = useStyles()

  const items = [
    {
      id: 'website',
      icon: LanguageIcon,
      label: websiteUrl ? 'Visit Website' : undefined,
      url: websiteUrl,
      type: 'website'
    },
    {
      id: 'email',
      icon: EmailIcon,
      label: email ? 'Send Email' : undefined,
      url: `mailto:${email}`,
      type: 'email'
    },
    {
      id: 'gumroad',
      icon: GumroadIcon,
      label: gumroadUsername ? 'Gumroad' : undefined,
      url: getUrlForGumroadUsername(gumroadUsername),
      type: 'gumroad'
    },
    {
      id: 'vrchatUsername',
      icon: VrChatIcon,
      label: vrchatUsername
        ? vrchatUsername
        : vrchatUserId
        ? 'VRChat Profile'
        : undefined,
      iconClass: classes.vrchatIcon,
      url: vrchatUserId ? getUrlForVrChatUserId(vrchatUserId) : undefined,
      type: 'vrchat'
    },
    {
      id: 'neosVrUsername',
      icon: () => 'NVR',
      label: neosVrUsername,
      type: 'neosvr'
    },
    {
      id: 'chilloutVrUsername',
      icon: () => 'CVR',
      label: chilloutVrUsername,
      type: 'chilloutvr'
    },
    {
      id: 'discordUsername',
      icon: DiscordIcon,
      label: discordUsername,
      type: 'discord'
    },
    {
      id: 'discordServerInviteUrl',
      icon: DiscordIcon,
      label: discordServerInviteUrl ? 'Join Discord Server' : undefined,
      url: discordServerInviteUrl,
      type: 'discord'
    },
    {
      id: 'twitterUsername',
      icon: TwitterIcon,
      label: twitterUsername ? `@${twitterUsername}` : undefined,
      url: getUrlForTwitterUsername(twitterUsername),
      type: 'twitter'
    },
    {
      id: 'telegramUsername',
      icon: TelegramIcon,
      label: telegramUsername ? `@${telegramUsername}` : undefined,
      url: getUrlForTelegramUsername(telegramUsername),
      type: 'telegram'
    },
    {
      id: 'youtubeChannelId',
      icon: YouTubeIcon,
      label: youtubeChannelId ? `YouTube Channel` : undefined,
      url: getUrlForYouTubeChannelByChannelId(youtubeChannelId),
      type: 'youtube'
    },
    {
      id: 'twitchUsername',
      icon: TwitchIcon,
      label: twitchUsername,
      url: getUrlForTwitchByUsername(twitchUsername),
      type: 'twitch'
    },
    {
      id: 'patreonUsername',
      icon: PatreonIcon,
      label: patreonUsername,
      url: getUrlForPatreonByUsername(patreonUsername),
      type: 'patreon'
    },
    {
      id: 'boothUsername',
      icon: BoothIcon,
      label: boothUsername,
      url: getUrlForBoothByUsername(boothUsername),
      type: 'booth',
      iconClass: classes.boothIcon
    }
  ]
  return (
    <div className={classes.items}>
      {items.map(item => (
        <SocialMediaListItem
          key={item.id}
          item={item}
          actionCategory={actionCategory}
        />
      ))}
    </div>
  )
}
