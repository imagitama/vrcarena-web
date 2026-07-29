import React, { useEffect, useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useDataStoreItems from '@/hooks/useDataStoreItems'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'

import { handleError } from '@/error-handling'
import { trackAction } from '@/analytics'
import { AssetFields } from '@/modules/assets'
import {
  CollectionNames,
  DiscordServer,
  DiscordServerFields,
  ViewNames,
} from '@/modules/discordservers'
import { AssetEditorProps } from '@/generic-forms'

import TextInput from '@/components/text-input'
import SearchForIdForm from '@/components/search-for-id-form'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import SuccessMessage from '@/components/success-message'
import DiscordServerResults from '@/components/discord-server-results'
import DiscordServerResultsItem from '@/components/discord-server-results-item'
import Button from '@/components/button'
import FormControls from '@/components/form-controls'
import WarningMessage from '@/components/warning-message'
import useDataStoreItem from '@/hooks/useDataStoreItem'

const SearchResultRenderer = ({
  result,
  onClick,
}: {
  result: DiscordServer
  onClick?: () => void
}) => {
  return (
    <DiscordServerResultsItem
      discordServer={result}
      onClick={(e) => {
        if (onClick) {
          onClick()
        }
        e.preventDefault()
        return false
      }}
    />
  )
}

const CreateForm = ({
  onClickWithIdAndDetails,
  actionCategory,
  onCancel,
}: {
  onClickWithIdAndDetails: (id: string, details: DiscordServer) => void
  actionCategory?: string
  onCancel: () => void
}) => {
  const [name, setName] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [widgetId, setWidgetId] = useState('')
  const [
    isSaving,
    isSuccess,
    lastErrorCode,
    create,
    clear,
    createdDiscordServer,
  ] = useDataStoreCreate<DiscordServer>(CollectionNames.DiscordServers)

  const onCreate = async () => {
    try {
      if (actionCategory) {
        trackAction(actionCategory, 'Click create Discord Server button')
      }

      await create({
        name,
        inviteurl: inviteUrl,
        widgetid: widgetId,
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const restart = () => {
    clear()
  }

  const onDone = () => {
    if (!createdDiscordServer) {
      throw new Error('No created Discord server')
    }
    onClickWithIdAndDetails(createdDiscordServer.id, createdDiscordServer)
  }

  if (isSaving) {
    return <LoadingIndicator message="Creating Discord Server..." />
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        Discord Server created successfully
        <br />
        <br />
        <Button onClick={() => onDone()}>Use the Discord Server</Button>
      </SuccessMessage>
    )
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage onOkay={restart}>
        Failed to create the Discord Server (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  return (
    <>
      <p>Enter the name of the Discord server:</p>{' '}
      <TextInput
        onChange={(e) => setName(e.target.value)}
        value={name}
        fullWidth
      />
      <br />
      <p>Enter the invite URL (ensure it does not expire):</p>
      <TextInput
        onChange={(e) => setInviteUrl(e.target.value)}
        value={inviteUrl}
        fullWidth
      />
      <br />
      <p>
        (Optional) If possible enable the widget and paste the widget ID here so
        we can try and populate the data automatically:
      </p>
      <TextInput
        onChange={(e) => setWidgetId(e.target.value)}
        value={widgetId}
        fullWidth
      />
      <FormControls>
        <Button onClick={() => onCreate()} icon={<CheckIcon />}>
          Create
        </Button>{' '}
        <Button onClick={() => onCancel()} color="secondary">
          Cancel
        </Button>
      </FormControls>
    </>
  )
}

const AllDiscordServers = ({
  onClickWithIdAndDetails,
  onCancel,
}: {
  onClickWithIdAndDetails: (id: string, details: DiscordServer) => void
  onCancel: () => void
}) => {
  const [isLoading, lastErrorCode, results] = useDataStoreItems<DiscordServer>(
    ViewNames.GetPublicDiscordServers,
    undefined,
    { queryName: 'get-discord-servers-for-form' }
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Finding Discord Servers..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage onOkay={onCancel}>
        Failed to find Discord Servers (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  return (
    <>
      <DiscordServerResults
        discordServers={results}
        onClickWithEventAndIdAndDetails={(e, id, details) => {
          onClickWithIdAndDetails(id, details)
          e.preventDefault()
          return false
        }}
      />
      <FormControls>
        <Button onClick={() => onCancel()} color="secondary">
          Cancel
        </Button>
      </FormControls>
    </>
  )
}

type DiscordServerId = AssetFields['discordserver']

const ChangeDiscordServerForm = ({
  value,
  collectionName = undefined,
  id = undefined,
  associatedRecord = undefined,
  overrideSave = undefined,
  onDone = undefined,
  actionCategory = undefined,
  onChange,
}: {
  value: string | null
  collectionName?: string
  id?: string
  onChange?: (id: string | null) => void
} & AssetEditorProps<DiscordServerId, DiscordServer>) => {
  const [selectedDiscordServerId, setSelectedDiscordServerId] = useState<
    string | null
  >(value)
  const [, , discordServer] = useDataStoreItem<DiscordServer>(
    CollectionNames.DiscordServers,
    selectedDiscordServerId || false
  )
  const [isSaving, isSuccess, lastErrorCode, save] =
    useDataStoreEdit<AssetFields>(collectionName || '', id || false)
  const [isShowingForm, setIsShowingForm] = useState(false)
  const [isBrowsingAll, setIsBrowsingAll] = useState(false)

  useEffect(() => {
    setSelectedDiscordServerId(value)
  }, [value])

  const onIdAndDetails = (id: string, data: DiscordServer) => {
    setIsShowingForm(false)
    setIsBrowsingAll(false)
    setSelectedDiscordServerId(id)

    if (onChange) {
      onChange(id)
    }
  }

  const onSave = async (overrideValue?: string | null) => {
    try {
      const newValue =
        overrideValue !== undefined
          ? overrideValue
          : selectedDiscordServerId || null

      if (actionCategory) {
        trackAction(actionCategory, 'Click save Discord Server button', {
          collectionName,
          id,
          discordServerId: newValue,
        })
      }

      if (overrideSave) {
        overrideSave(newValue)

        if (onDone) {
          onDone()
        }
        return
      }

      await save({
        discordserver: newValue,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onClear = () => {
    if (onChange) {
      onChange(null)
    } else {
      onSave(null)
    }
  }

  const onClickCreate = () => setIsShowingForm(true)
  const onClickBrowseAll = () => setIsBrowsingAll(true)

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        Resource has been updated with Discord Server notice
      </SuccessMessage>
    )
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage>
        Failed to save the resource (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (isBrowsingAll) {
    return (
      <AllDiscordServers
        onClickWithIdAndDetails={onIdAndDetails}
        onCancel={() => setIsShowingForm(false)}
      />
    )
  }

  if (isShowingForm) {
    return (
      <CreateForm
        onClickWithIdAndDetails={onIdAndDetails}
        actionCategory={actionCategory}
        onCancel={() => setIsShowingForm(false)}
      />
    )
  }

  if (selectedDiscordServerId) {
    if (discordServer) {
      return (
        <>
          You have selected:
          <DiscordServerResultsItem
            discordServer={{
              ...discordServer,
            }}
            onClick={(e) => {
              e.preventDefault()
              return false
            }}
          />
          <FormControls>
            {onChange === undefined ? (
              <Button onClick={() => onSave()} icon={<SaveIcon />}>
                Save
              </Button>
            ) : null}{' '}
            <Button onClick={() => onClear()} color="secondary">
              Clear
            </Button>
          </FormControls>
        </>
      )
    } else {
      return <>Loading Discord server...</>
    }
  }

  return (
    <div>
      <WarningMessage noMargin small>
        Only set a Discord server if they are <strong>required</strong> to join
        to be able to purchase/download this asset. Set a support Discord in the
        author.
      </WarningMessage>
      <SearchForIdForm
        label="Search for a Discord server"
        collectionName={CollectionNames.DiscordServers}
        renderer={SearchResultRenderer}
        onClickWithIdAndDetails={onIdAndDetails}
      />
      <FormControls>
        <Button
          onClick={() => onClickCreate()}
          icon={<AddIcon />}
          color="secondary">
          Add Server
        </Button>{' '}
        <Button onClick={() => onClickBrowseAll()} color="secondary">
          List All Servers
        </Button>
      </FormControls>
    </div>
  )
}

export default ChangeDiscordServerForm
