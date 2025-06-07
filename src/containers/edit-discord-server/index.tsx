import React from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'

import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { canCreateDiscordServer, canEditDiscordServer } from '../../permissions'
import { CollectionNames } from '../../modules/discordservers'

const View = () => {
  const { discordServerId } = useParams<{ discordServerId: string }>()
  const [isLoading, isErrored, user] = useUserRecord()
  const isCreating = !discordServerId || discordServerId === 'create'

  if (isLoading) {
    return <LoadingIndicator message="Loading your account..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load your account</ErrorMessage>
  }

  if (
    !user ||
    (isCreating && !canCreateDiscordServer(user)) ||
    (!isCreating && !canEditDiscordServer(user))
  ) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">
        {isCreating ? 'Create' : 'Edit'} Discord Server
      </Heading>
      <GenericEditor
        collectionName={CollectionNames.DiscordServers}
        id={isCreating ? undefined : discordServerId}
        analyticsCategory={
          isCreating ? 'CreateDiscordServer' : 'EditDiscordServer'
        }
        saveBtnAction="Click save button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewDiscordServerWithVar.replace(
          ':discordServerId',
          discordServerId
        )}
        getSuccessUrl={(newRecordId) =>
          routes.viewDiscordServerWithVar.replace(
            ':discordServerId',
            newRecordId || 'error'
          )
        }
        cancelUrl={
          isCreating
            ? routes.discordServers
            : routes.viewDiscordServerWithVar.replace(
                ':discordServerId',
                discordServerId
              )
        }
      />
    </>
  )
}

export default () => {
  const { discordServerId } = useParams<{ discordServerId: string }>()
  const isCreating = !discordServerId || discordServerId === 'create'

  return (
    <>
      <Helmet>
        <title>
          {isCreating ? 'Create' : 'Edit'} a Discord server | VRCArena
        </title>
        <meta
          name="description"
          content={`Use this form to ${
            isCreating ? 'create' : 'edit'
          } a Discord server.`}
        />
      </Helmet>
      <View />
    </>
  )
}
