import React from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import DiscordServerResults from '../../components/discord-server-results'

import * as routes from '../../routes'
import { DiscordServerFieldNames } from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  }
})

const Renderer = ({ items }) => <DiscordServerResults discordServers={items} />

export default () => {
  const classes = useStyles()

  return (
    <>
      <Helmet>
        <title>View Discord servers | VRCArena</title>
        <meta
          name="description"
          content="Browse Discord servers that are related to the assets and species of the site."
        />
      </Helmet>
      <div className={classes.root}>
        <Heading variant="h1">
          <Link to={routes.discordServers}>Discord Servers</Link>
        </Heading>
        <BodyText>A list of Discord servers.</BodyText>
        <PaginatedView
          viewName="getPublicDiscordServers"
          editorViewName="getFullDiscordServers"
          sortKey="discord-servers"
          defaultFieldName={DiscordServerFieldNames.name}
          urlWithPageNumberVar={routes.viewDiscordServersWithPageNumberVar}
          createUrl={routes.createDiscordServer}
          showCommonMetaControls>
          <Renderer />
        </PaginatedView>
      </div>
    </>
  )
}
