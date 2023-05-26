import React from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import PaginatedView from '../../components/paginated-view'
import PlaylistResults from '../../components/playlist-results'

import * as routes from '../../routes'
import { PlaylistsFieldNames } from '../../data-store'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  }
})

const Renderer = ({ items }) => <PlaylistResults playlists={items} />

export default () => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Helmet>
        <title>View playlists | VRCArena</title>
        <meta
          name="description"
          content="Browse all of the user-created playlists of assets."
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.playlists}>Playlists</Link>
      </Heading>
      <BodyText>
        A list of all user-created playlists of the assets on the site.
      </BodyText>
      <PaginatedView
        viewName="getPublicPlaylists"
        editorViewName="getFullPlaylists"
        sortKey="playlists"
        defaultFieldName={PlaylistsFieldNames.title}
        urlWithPageNumberVar={routes.playlistsWithPageNumberVar}
        createUrl={routes.createPlaylist}
        showCommonMetaControls>
        <Renderer />
      </PaginatedView>
    </div>
  )
}
