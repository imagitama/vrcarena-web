import React from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'

import { CollectionNames } from '../../data-store'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { canCreateDiscordServer, canEditDiscordServer } from '../../permissions'

const View = () => {
  const [isLoading, isErrored, user] = useUserRecord()
  const { playlistId } = useParams()
  const isCreating = !playlistId || playlistId === 'create'

  if (isLoading) {
    return <LoadingIndicator message="Loading your account..." />
  }

  if (isErrored) {
    return <ErrorMessage />
  }

  if (
    (isCreating && !canCreateDiscordServer(user)) ||
    (!isCreating && !canEditDiscordServer(user))
  ) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">{isCreating ? 'Create' : 'Edit'} Playlist</Heading>
      <GenericEditor
        collectionName={CollectionNames.Playlists}
        viewName={'getFullPlaylists'}
        id={isCreating ? undefined : playlistId}
        analyticsCategory={
          isCreating ? 'CreateDiscordServer' : 'EditDiscordServer'
        }
        saveBtnAction="Click save button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewPlaylistWithVar.replace(
          ':playlistId',
          playlistId
        )}
        getSuccessUrl={newId =>
          routes.viewPlaylistWithVar.replace(':playlistId', newId)
        }
        cancelUrl={
          isCreating
            ? routes.playlists
            : routes.viewPlaylistWithVar.replace(':playlistId', playlistId)
        }
        changeMetaFields={false}
      />
    </>
  )
}

export default () => {
  const { playlistId } = useParams()
  const isCreating = !playlistId || playlistId === 'create'

  return (
    <>
      <Helmet>
        <title>{isCreating ? 'Create' : 'Edit'} a playlist | VRCArena</title>
        <meta
          name="description"
          content={`Use this form to ${
            isCreating ? 'create' : 'edit'
          } a playlist.`}
        />
      </Helmet>
      <View />
    </>
  )
}
