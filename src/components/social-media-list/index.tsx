import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Booth as BoothIcon,
  ChilloutVR as ChilloutVRIcon,
  Discord as DiscordIcon,
  Gumroad as GumroadIcon,
  Resonite as ResoniteIcon,
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
import { getAuthorUrlForItchUsername } from '../../itch'
import { getAuthorUrlForJinxxyUsername } from '../../jinxxy'

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
      {Icon && (
        <div className={classes.iconWrapper}>
          <Icon className={`${classes.icon} ${iconClass || ''}`} />
        </div>
      )}
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

const SocialMediaList = ({
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
    itchUsername,
    jinxxyUsername,
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
    itchUsername?: string
    jinxxyUsername?: string
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
      url: gumroadUsername
        ? getUrlForGumroadUsername(gumroadUsername)
        : undefined,
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
      url: vrchatUserId ? getUrlForVrChatUserId(vrchatUserId) : undefined,
      type: 'vrchat',
    },
    {
      id: 'neosVrUsername',
      icon: ResoniteIcon,
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
      url: twitterUsername
        ? getUrlForTwitterUsername(twitterUsername)
        : undefined,
      type: 'twitter',
    },
    {
      id: 'telegramUsername',
      icon: TelegramIcon,
      label: telegramUsername ? `@${telegramUsername}` : undefined,
      url: telegramUsername
        ? getUrlForTelegramUsername(telegramUsername)
        : undefined,
      type: 'telegram',
    },
    {
      id: 'youtubeChannelId',
      icon: YouTubeIcon,
      label: youtubeChannelId ? `YouTube Channel` : undefined,
      url: youtubeChannelId
        ? getUrlForYouTubeChannelByChannelId(youtubeChannelId)
        : undefined,
      type: 'youtube',
    },
    {
      id: 'twitchUsername',
      icon: TwitchIcon,
      label: twitchUsername,
      url: twitchUsername
        ? getUrlForTwitchByUsername(twitchUsername)
        : undefined,
      type: 'twitch',
    },
    {
      id: 'patreonUsername',
      icon: PatreonIcon,
      label: patreonUsername,
      url: patreonUsername
        ? getUrlForPatreonByUsername(patreonUsername)
        : undefined,
      type: 'patreon',
    },
    {
      id: 'boothUsername',
      icon: BoothIcon,
      label: boothUsername,
      url: boothUsername ? getUrlForBoothByUsername(boothUsername) : undefined,
      type: 'booth',
    },
    {
      id: 'itchUsername',
      icon: null, // TODO
      // icon: BoothIcon,
      label: itchUsername,
      url: itchUsername ? getAuthorUrlForItchUsername(itchUsername) : undefined,
      type: 'itch',
    },
    {
      id: 'jinxxyUsername',
      icon: null, // TODO
      // icon: BoothIcon,
      label: jinxxyUsername,
      url: jinxxyUsername
        ? getAuthorUrlForJinxxyUsername(jinxxyUsername)
        : undefined,
      type: 'jinxxy',
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

export default SocialMediaList
