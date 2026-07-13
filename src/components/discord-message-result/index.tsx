import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import { CachedDiscordMessage } from '@/modules/discordmessagecache'
import { getAvatarImageUrl } from '@/discord'
import { getFormattedDate } from '@/utils/dates'
import { VRCArenaTheme } from '@/themes'
import { trimDescription } from '@/utils/formatting'
import ExpandIcon from '../expand-icon'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(1),
  },
  contentBox: {
    flex: 1,
  },
  username: {
    fontWeight: 500,
    color: '#ffffff',
    marginRight: theme.spacing(1),
  },
  timestamp: {
    '&&': {
      fontSize: '0.75rem',
      color: '#72767d',
      marginLeft: '0.25rem',
    },
  },
  content: {
    '&&': {
      color: '#dcddde',
      marginTop: theme.spacing(0.5),
      whiteSpace: 'pre-wrap',
      fontSize: '75%',
    },
  },
}))

const DiscordMessageResult = ({
  message,
  trim,
}: {
  message: CachedDiscordMessage
  trim?: boolean
}) => {
  const classes = useStyles()
  const [isExpanded, setIsExpanded] = useState(!trim)

  return (
    <div className={classes.root}>
      <Avatar
        src={
          message.rawdata.author.avatar
            ? getAvatarImageUrl(
                message.rawdata.author.id,
                message.rawdata.author.avatar
              )
            : undefined
        }
        className={classes.avatar}
      />
      <Box className={classes.contentBox}>
        <Box display="flex" alignItems="center" flexWrap="wrap">
          <Typography className={classes.username}>
            {message.rawdata.author.username}
          </Typography>
          <Typography className={classes.timestamp}>
            {getFormattedDate(message.sentat, 'MMM d, yyyy h:mm a')}
          </Typography>
        </Box>
        <Typography className={classes.content}>
          {trim && !isExpanded
            ? trimDescription(message.content)
            : message.content}{' '}
          {trim && !isExpanded && (
            <ExpandIcon
              isExpanded={isExpanded}
              onClick={() => setIsExpanded(true)}
            />
          )}
        </Typography>
      </Box>
    </div>
  )
}

export default DiscordMessageResult
