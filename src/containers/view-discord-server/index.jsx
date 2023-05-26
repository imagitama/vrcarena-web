import React, { useState } from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import LaunchIcon from '@material-ui/icons/Launch'
import SyncIcon from '@material-ui/icons/Sync'

import * as routes from '../../routes'

import Markdown from '../../components/markdown'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'
import Button from '../../components/button'
import DiscordServerWidget from '../../components/discord-server-widget'
import PageControls from '../../components/page-controls'
import Message from '../../components/message'
import EditorRecordManager from '../../components/editor-record-manager'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  DiscordServerFieldNames,
  ApprovalStatuses,
  AccessStatuses
} from '../../hooks/useDatabaseQuery'
import { canEditDiscordServer } from '../../utils'
import { trackAction } from '../../analytics'
import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import { CollectionNames, CommonMetaFieldNames } from '../../data-store'
import useDataStoreItem from '../../hooks/useDataStoreItem'

const analyticsCategory = 'ViewDiscordServer'

function SyncDiscordServerButton({ discordServerId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(null)

  const onClick = async () => {
    try {
      if (isLoading) {
        return
      }

      setIsLoading(true)
      setIsSuccess(false)

      await callFunction('syncDiscordServerById', {
        id: discordServerId
      })

      setIsLoading(false)
      setIsSuccess(true)
    } catch (err) {
      handleError(err)
      setIsSuccess(false)
    }
  }

  return (
    <Button onClick={onClick} icon={<SyncIcon />}>
      {isLoading
        ? 'Working...'
        : isSuccess === true
        ? 'Synced'
        : isSuccess === false
        ? 'Failed to sync'
        : 'Sync'}
    </Button>
  )
}

const View = () => {
  const { discordServerId } = useParams()
  const [, , user] = useUserRecord()
  const [isLoading, isErrored, result, hydrate] = useDataStoreItem(
    'getfulldiscordservers',
    discordServerId
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get Discord server</ErrorMessage>
  }
  if (!result) {
    return <ErrorMessage>The Discord server does not exist</ErrorMessage>
  }

  const {
    [DiscordServerFieldNames.name]: name,
    [DiscordServerFieldNames.description]: description,
    [DiscordServerFieldNames.widgetId]: widgetId,
    [DiscordServerFieldNames.iconUrl]: iconUrl,
    [DiscordServerFieldNames.inviteUrl]: inviteUrl,
    [DiscordServerFieldNames.requiresPatreon]: requiresPatreon,
    [DiscordServerFieldNames.patreonUrl]: patreonUrl,

    // meta
    [CommonMetaFieldNames.publishStatus]: publishStatus,
    [CommonMetaFieldNames.accessStatus]: accessStatus,
    [CommonMetaFieldNames.approvalStatus]: approvalStatus,
    [CommonMetaFieldNames.editorNotes]: editorNotes
  } = result

  const isApproved = approvalStatus === ApprovalStatuses.Approved
  const isDeleted = accessStatus === AccessStatuses.Deleted

  return (
    <>
      <Helmet>
        <title>View Discord server {name} | VRCArena</title>
        <meta
          name="description"
          content={`View the Discord server named ${name}`}
        />
      </Helmet>

      {isApproved !== true && (
        <Message>This Discord Server is unapproved</Message>
      )}
      {isDeleted !== false && <Message>This Discord Server is deleted</Message>}
      {editorNotes && (
        <Message>
          <strong>Notes from our staff</strong>
          <br />
          <br />
          {editorNotes}
        </Message>
      )}

      {iconUrl && <img src={iconUrl} alt={`Icon for server ${name}`} />}

      <Heading variant="h1">
        <Link
          to={routes.viewAuthorWithVar.replace(
            ':discordServerId',
            discordServerId
          )}>
          {name}
        </Link>
      </Heading>

      {description && <Markdown source={description} />}

      {inviteUrl && (
        <Button
          url={inviteUrl}
          icon={<LaunchIcon />}
          onClick={() =>
            trackAction(
              analyticsCategory,
              'Click Discord server invite button',
              discordServerId
            )
          }>
          Join Server
        </Button>
      )}

      {requiresPatreon && (
        <>
          This server requires you are a Patreon subscriber before you join.
          <br />
          <Button
            url={patreonUrl}
            icon={<LaunchIcon />}
            onClick={() =>
              trackAction(
                analyticsCategory,
                'Click join Patreon button',
                discordServerId
              )
            }>
            Join Patreon
          </Button>
        </>
      )}

      {widgetId && (
        <DiscordServerWidget
          serverId={widgetId}
          joinActionCategory={analyticsCategory}
        />
      )}

      {canEditDiscordServer(user) && (
        <>
          <Heading variant="h2">Actions</Heading>
          <EditorRecordManager
            id={discordServerId}
            metaCollectionName={CollectionNames.DiscordServersMeta}
            existingApprovalStatus={approvalStatus}
            existingPublishStatus={publishStatus}
            existingAccessStatus={accessStatus}
            existingEditorNotes={editorNotes}
            onDone={() => hydrate()}
          />
          <br />
          <br />
          <SyncDiscordServerButton discordServerId={discordServerId} />
        </>
      )}

      <PageControls>
        <Button
          url={routes.discordServers}
          color="default"
          onClick={() =>
            trackAction(analyticsCategory, 'Click all Discord servers button')
          }>
          View All Discord Servers
        </Button>
      </PageControls>
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View a Discord server | VRCArena</title>
      <meta
        name="description"
        content="View more details about a Discord server."
      />
    </Helmet>
    <View />
  </>
)
