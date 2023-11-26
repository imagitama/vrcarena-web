import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Booth as BoothIcon,
  ChilloutVR as ChilloutVRIcon,
  Discord as DiscordIcon,
  Gumroad as GumroadIcon,
  NeosVR as NeosVRIcon,
  Patreon as PatreonIcon,
  Twitch as TwitchIcon,
  VRChat as VRChatIcon,
  Email as EmailIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  Telegram as TelegramIcon,
  Website as WebsiteIcon,
} from '../../icons'
import {
  getUrlForVrChatUserId,
  getUrlForTwitterUsername,
  getUrlForTelegramUsername,
  getUrlForYouTubeChannelByChannelId,
  getUrlForTwitchByUsername,
  getUrlForGumroadUsername,
  getUrlForPatreonByUsername,
  getUrlForBoothByUsername,
} from '../../social-media'
import { trackAction } from '../../analytics'

import Paper from '../paper'

export const socialMediaType = {
  twitter: 'twitter',
  discord: 'discord',
  website: 'website',
  gumroad: 'gumroad',
}

const useStyles = makeStyles({
  items: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  item: {
    padding: '0.25rem 0.5rem',
    display: 'flex',
    alignItems: 'center',
    margin: '0 0.25rem 0.25rem 0',
    '& > a': {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
  },
  notUrl: {
    cursor: 'default',
  },
  iconWrapper: {
    height: '2rem',
    display: 'flex',
    alignItems: 'center',
    marginRight: '0.5rem',
    textAlign: 'right',
  },
  icon: {
    verticalAlign: 'middle',
    width: '1em',
    height: '1em',
    fill: 'currentColor',
  },
  vrchatIcon: {},
  boothIcon: {},
  // vrchatIcon: {
  //   fontSize: '200%',
  // },
  // boothIcon: {
  //   fontSize: '150%',
  //   '& path': {
  //   },
  // },
})

interface SocialMediaItem {
  id: string
  type: string
  icon: any
  iconClass?: string
  url?: string
  label?: string
}

function SocialMediaListItem({
  actionCategory,
  item: { type, icon: Icon, iconClass, url, label },
}: {
  actionCategory: string
  item: SocialMediaItem
}) {
  const classes = useStyles()

  if (!label) {
    return null
  }

  const contents = (
    <>
      <div className={classes.iconWrapper}>
        <Icon className={`${classes.icon} ${iconClass || ''}`} />
      </div>
      {label}
    </>
  )

  const wrapper = url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackAction(actionCategory, `Click "${type}" social media button`)
      }>
      {contents}
    </a>
  ) : (
    contents
  )

  return <Paper className={classes.item}>{wrapper}</Paper>
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
    boothUsername,
  },
}: {
  actionCategory: string
  socialMedia: {
    websiteUrl?: string
    email?: string
    gumroadUsername?: string
    vrchatUsername?: string
    vrchatUserId?: string
    chilloutVrUsername?: string
    neosVrUsername?: string
    discordUsername?: string
    twitterUsername?: string
    telegramUsername?: string
    youtubeChannelId?: string
    twitchUsername?: string
    patreonUsername?: string
    discordServerInviteUrl?: string
    boothUsername?: string
  }
}) => {
  const classes = useStyles()

  const items: SocialMediaItem[] = [
    {
      id: 'website',
      icon: WebsiteIcon,
      label: websiteUrl ? 'Visit Website' : undefined,
      url: websiteUrl,
      type: 'website',
    },
    {
      id: 'email',
      icon: EmailIcon,
      label: email ? 'Send Email' : undefined,
      url: `mailto:${email}`,
      type: 'email',
    },
    {
      id: 'gumroad',
      icon: GumroadIcon,
      label: gumroadUsername ? 'Gumroad' : undefined,
      url: getUrlForGumroadUsername(gumroadUsername),
      type: 'gumroad',
    },
    {
      id: 'vrchatUsername',
      icon: VRChatIcon,
      label: vrchatUsername
        ? vrchatUsername
        : vrchatUserId
        ? 'VRChat Profile'
        : undefined,
      iconClass: classes.vrchatIcon,
      url: vrchatUserId ? getUrlForVrChatUserId(vrchatUserId) : undefined,
      type: 'vrchat',
    },
    {
      id: 'neosVrUsername',
      icon: NeosVRIcon,
      label: neosVrUsername,
      type: 'neosvr',
    },
    {
      id: 'chilloutVrUsername',
      icon: ChilloutVRIcon,
      label: chilloutVrUsername,
      type: 'chilloutvr',
    },
    {
      id: 'discordUsername',
      icon: DiscordIcon,
      label: discordUsername,
      type: 'discord',
    },
    {
      id: 'discordServerInviteUrl',
      icon: DiscordIcon,
      label: discordServerInviteUrl ? 'Join Discord Server' : undefined,
      url: discordServerInviteUrl,
      type: 'discord',
    },
    {
      id: 'twitterUsername',
      icon: TwitterIcon,
      label: twitterUsername ? `@${twitterUsername}` : undefined,
      url: getUrlForTwitterUsername(twitterUsername),
      type: 'twitter',
    },
    {
      id: 'telegramUsername',
      icon: TelegramIcon,
      label: telegramUsername ? `@${telegramUsername}` : undefined,
      url: getUrlForTelegramUsername(telegramUsername),
      type: 'telegram',
    },
    {
      id: 'youtubeChannelId',
      icon: YouTubeIcon,
      label: youtubeChannelId ? `YouTube Channel` : undefined,
      url: getUrlForYouTubeChannelByChannelId(youtubeChannelId),
      type: 'youtube',
    },
    {
      id: 'twitchUsername',
      icon: TwitchIcon,
      label: twitchUsername,
      url: getUrlForTwitchByUsername(twitchUsername),
      type: 'twitch',
    },
    {
      id: 'patreonUsername',
      icon: PatreonIcon,
      label: patreonUsername,
      url: getUrlForPatreonByUsername(patreonUsername),
      type: 'patreon',
    },
    {
      id: 'boothUsername',
      icon: BoothIcon,
      label: boothUsername,
      url: getUrlForBoothByUsername(boothUsername),
      type: 'booth',
      iconClass: classes.boothIcon,
    },
  ]
  return (
    <div className={classes.items}>
      {items.map((item) => (
        <SocialMediaListItem
          key={item.id}
          item={item}
          actionCategory={actionCategory}
        />
      ))}
    </div>
  )
}
