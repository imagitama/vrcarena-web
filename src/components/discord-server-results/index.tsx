import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import DiscordServerResultsItem from '../discord-server-results-item'
import { DiscordServer } from '../../modules/discordservers'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
})

export default ({
  discordServers,
  onClickWithEventAndIdAndDetails,
}: {
  discordServers: DiscordServer[]
  onClickWithEventAndIdAndDetails: (
    e: any,
    id: string,
    details: DiscordServer
  ) => void
}) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {discordServers.map((discordServer) => (
        <DiscordServerResultsItem
          key={discordServer.id}
          discordServer={discordServer}
          onClick={
            onClickWithEventAndIdAndDetails
              ? (e: any) =>
                  onClickWithEventAndIdAndDetails(
                    e,
                    discordServer.id,
                    discordServer
                  )
              : undefined
          }
        />
      ))}
    </div>
  )
}
