import React, { useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  DiscordServerFieldNames,
  GetFullAssetsFieldNames
} from '../../../../hooks/useDatabaseQuery'
import TabContext from '../../context'

const useStyles = makeStyles({
  root: {
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    padding: '0.5rem'
  }
})

export default () => {
  const { isLoading, asset, trackAction } = useContext(TabContext)
  const classes = useStyles()

  if (
    isLoading ||
    !asset ||
    !asset[GetFullAssetsFieldNames.discordServerData]
  ) {
    return null
  }

  const {
    id: discordServerId,
    [DiscordServerFieldNames.name]: name,
    // [DiscordServerFieldNames.widgetId]: widgetId,
    // [DiscordServerFieldNames.iconUrl]: iconUrl,
    [DiscordServerFieldNames.inviteUrl]: inviteUrl,
    [DiscordServerFieldNames.requiresPatreon]: requiresPatreon,
    [DiscordServerFieldNames.patreonUrl]: patreonUrl
  } = asset[GetFullAssetsFieldNames.discordServerData]

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
              trackAction(
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
              trackAction('Click join Discord server link', discordServerId)
            }>
            Join Here
          </a>
        </>
      ) : null}
    </div>
  )
}
