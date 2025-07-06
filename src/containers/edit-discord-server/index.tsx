import React from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import NoPermissionMessage from '../../components/no-permission-message'
import * as routes from '../../routes'
import { CollectionNames } from '../../modules/discordservers'
import usePermissions from '../../hooks/usePermissions'

const View = () => {
  const { discordServerId } = useParams<{ discordServerId: string }>()
  const isCreating = !discordServerId || discordServerId === 'create'

  if (
    !usePermissions(
      isCreating ? routes.createDiscordServer : routes.editDiscordServerWithVar
    )
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
