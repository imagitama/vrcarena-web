import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import WarningIcon from '@material-ui/icons/Warning'

import { trackAction } from '../../analytics'
import { DiscordServerData } from '../../modules/assets'
import Box from '../box'
import { Discord as DiscordIcon } from '../../icons'
import { discordPurple } from '../../config'
import Button from '../button'

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: '0.25rem',
    },
  },
  desc: {
    padding: '0.25rem',
  },
  buttonWrapper: {
    marginTop: '0.25rem',
    '& > div:first-child': {
      marginBottom: '0.25rem',
      fontWeight: 'bold',
    },
  },
})

const DiscordServerMustJoinNotice = ({
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
  const classes = useStyles()
  return (
    <Box icon={<DiscordIcon />} color={discordPurple} className={className}>
      <div className={classes.title}>
        <WarningIcon /> Discord Server Required
      </div>
      <div className={classes.desc}>
        To visit this URL you must be a member of the Discord server "
        {discordServerData && discordServerData.name}"
        <br />
        {discordServerData && discordServerData.requirespatreon ? (
          <div className={classes.buttonWrapper}>
            <div>You must be a Patreon: </div>
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
          </div>
        ) : discordServerData && discordServerData.inviteurl ? (
          <div className={classes.buttonWrapper}>
            <div>You must accept this invite: </div>
            <Button
              size="small"
              color="default"
              url={discordServerData.inviteurl}
              onClick={
                analyticsCategoryName
                  ? () =>
                      trackAction(
                        analyticsCategoryName,
                        'Click join Discord server link',
                        discordServerId
                      )
                  : undefined
              }>
              Join Server
            </Button>
          </div>
        ) : // assume it is being lazy-loaded in
        null}
      </div>
    </Box>
  )
}

export default DiscordServerMustJoinNotice
