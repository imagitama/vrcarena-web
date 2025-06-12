import React from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import DiscordServerResults from '../../components/discord-server-results'

import * as routes from '../../routes'
import { DiscordServer, ViewNames } from '../../modules/discordservers'

const Renderer = ({ items }: { items?: DiscordServer[] }) => (
  <DiscordServerResults discordServers={items || []} />
)

const DiscordServersView = () => {
  return (
    <>
      <Helmet>
        <title>View Discord servers | VRCArena</title>
        <meta
          name="description"
          content="Browse Discord servers that are related to the assets and species of the site."
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.discordServers}>Discord Servers</Link>
      </Heading>
      <BodyText>A list of Discord servers.</BodyText>
      <PaginatedView<DiscordServer>
        viewName={ViewNames.GetPublicDiscordServers}
        editorViewName={ViewNames.GetFullDiscordServers}
        name="discord-servers"
        defaultFieldName="name"
        urlWithPageNumberVar={routes.viewDiscordServersWithPageNumberVar}
        createUrl={routes.createDiscordServer}
        showCommonMetaControls>
        <Renderer />
      </PaginatedView>
    </>
  )
}

export default DiscordServersView
