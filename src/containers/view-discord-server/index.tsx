import React, { useState } from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import LaunchIcon from '@mui/icons-material/Launch'
import SyncIcon from '@mui/icons-material/Sync'
import EditIcon from '@mui/icons-material/Edit'

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
import { canEditDiscordServer } from '../../utils'
import { trackAction } from '../../analytics'
import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import {
  CollectionNames,
  FullDiscordServer,
  ViewNames,
} from '../../modules/discordservers'
import useIsEditor from '../../hooks/useIsEditor'
import { AccessStatus, ApprovalStatus } from '../../modules/common'

const analyticsCategory = 'ViewDiscordServer'

function SyncDiscordServerButton({
  discordServerId,
}: {
  discordServerId: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

  const onClick = async () => {
    try {
      if (isLoading) {
        return
      }

      setIsLoading(true)
      setIsSuccess(false)

      await callFunction('syncDiscordServerById', {
        id: discordServerId,
      })

      setIsLoading(false)
      setIsSuccess(true)
    } catch (err) {
      // TODO: Re-render with error code
      handleError(err)
      setIsSuccess(false)
    }
  }

  return (
    <Button onClick={onClick} icon={<SyncIcon />}>
      {isLoading
        ? 'Loading data...'
        : isSuccess === true
        ? 'Synced'
        : isSuccess === false
        ? 'Failed to sync'
        : 'Sync'}
    </Button>
  )
}

const View = () => {
  const { discordServerId } = useParams<{ discordServerId: string }>()
  const [, , user] = useUserRecord()
  const [isLoading, lastErrorCode, result, hydrate] =
    useDataStoreItem<FullDiscordServer>(
      ViewNames.GetFullDiscordServers,
      discordServerId
    )
  const isEditor = useIsEditor()

  if (isLoading) {
    return <LoadingIndicator message="Loading Discord server..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to get Discord server (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (!result) {
    return <ErrorMessage>The Discord server does not exist</ErrorMessage>
  }

  const {
    name: name,
    description: description,
    widgetid: widgetId,
    iconurl: iconUrl,
    inviteurl: inviteUrl,
    requirespatreon: requiresPatreon,
    patreonurl: patreonUrl,
    // meta
    publishstatus: publishStatus,
    accessstatus: accessStatus,
    approvalstatus: approvalStatus,
    editornotes: editorNotes,
  } = result

  const isApproved = approvalStatus === ApprovalStatus.Approved
  const isDeleted = accessStatus === AccessStatus.Deleted

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
      {isEditor ? (
        <Button
          url={routes.editDiscordServerWithVar.replace(
            ':discordServerId',
            discordServerId
          )}
          icon={<EditIcon />}>
          Edit
        </Button>
      ) : null}{' '}
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
      {description && <Markdown source={description} />}
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
      {user && canEditDiscordServer(user) && (
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
          color="secondary"
          onClick={() =>
            trackAction(analyticsCategory, 'Click all Discord servers button')
          }>
          View All Discord Servers
        </Button>
      </PageControls>
    </>
  )
}

const ViewDiscordServerView = () => (
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

export default ViewDiscordServerView
