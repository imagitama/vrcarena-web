import React from 'react'
import { makeStyles } from '@mui/styles'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import { CachedDiscordMessage } from '../../modules/discordmessagecache'
import { getAvatarImageUrl } from '../../discord'
import Paper from '../paper'
import { getFormattedDate } from '../../utils/dates'
import { VRCArenaTheme } from '../../themes'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  messageContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: '#36393f',
    color: 'white',
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(2),
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
    fontSize: '0.75rem',
    color: '#72767d',
  },
  content: {
    color: '#dcddde',
    marginTop: theme.spacing(0.5),
    whiteSpace: 'pre-wrap',
  },
}))

const DiscordMessageResult = ({
  message,
}: {
  message: CachedDiscordMessage
}) => {
  const classes = useStyles()

  return (
    <Paper className={classes.messageContainer}>
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
        <Box display="flex" alignItems="center">
          <Typography className={classes.username}>
            {message.rawdata.author.username}
          </Typography>
          <Typography className={classes.timestamp}>
            {getFormattedDate(message.sentat, 'MMM d, yyyy h:mm a')}
          </Typography>
        </Box>
        <Typography className={classes.content}>{message.content}</Typography>
      </Box>
    </Paper>
  )
}

export default DiscordMessageResult
