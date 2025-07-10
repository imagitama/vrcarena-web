import React, { useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import { makeStyles } from '@mui/styles'

import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { AssetFields, DiscordServerData } from '../../modules/assets'
import {
  CollectionNames,
  DiscordServer,
  ViewNames,
} from '../../modules/discordservers'

import TextInput from '../text-input'
import SearchForIdForm from '../search-for-id-form'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import DiscordServerResults from '../discord-server-results'
import DiscordServerResultsItem from '../discord-server-results-item'
import Button from '../button'
import FormControls from '../form-controls'
import WarningMessage from '../warning-message'
import { VRCArenaTheme } from '../../themes'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    outline: `3px dashed ${theme.palette.background.paper}`,
    borderRadius: theme.shape.borderRadius,
    padding: '1rem',
  },
  textInput: {
    width: '100%',
  },
}))

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
}: {
  onClickWithIdAndDetails: (id: string, details: DiscordServer) => void
  actionCategory?: string
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

interface FormProps {
  collectionName?: string
  id?: string
  existingDiscordServerId?: string | null
  existingDiscordServerData?: DiscordServerData
  overrideSave?: (newId: string | null | undefined) => void
  onDone?: () => void
  actionCategory?: string
}

const Form = ({
  collectionName = undefined,
  id = undefined,
  existingDiscordServerId = undefined,
  existingDiscordServerData = undefined,
  overrideSave = undefined,
  onDone = undefined,
  actionCategory = undefined,
}: FormProps) => {
  const [selectedDiscordServerId, setSelectedDiscordServerId] = useState<
    string | null | undefined
  >(existingDiscordServerId)
  const [selectedDiscordServerData, setSelectedDiscordServerData] = useState<
    DiscordServerData | undefined
  >(existingDiscordServerData)
  const [isSaving, isSuccess, lastErrorCode, save, clear] =
    useDataStoreEdit<AssetFields>(collectionName || '', id || false)
  const [isCreating, setIsCreating] = useState(false)
  const [isBrowsingAll, setIsBrowsingAll] = useState(false)

  const restart = () => {
    setIsCreating(false)
    setIsBrowsingAll(false)
    setSelectedDiscordServerId(undefined)
    setSelectedDiscordServerData(undefined)
    clear()
  }

  const onIdAndDetails = (id: string, data: DiscordServer) => {
    setIsCreating(false)
    setIsBrowsingAll(false)
    setSelectedDiscordServerId(id)
    setSelectedDiscordServerData(data)
  }

  const onSave = async (overrideValue?: string | null) => {
    try {
      const newValue =
        overrideValue !== undefined ? overrideValue : selectedDiscordServerId

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

  const onClear = () => onSave(null)

  const create = () => setIsCreating(true)
  const browseAll = () => setIsBrowsingAll(true)

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isSuccess) {
    return (
      <SuccessMessage onOkay={restart}>
        Resource has been updated with Discord Server notice
      </SuccessMessage>
    )
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage onOkay={restart}>
        Failed to save the resource (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (isBrowsingAll) {
    return (
      <AllDiscordServers
        onClickWithIdAndDetails={onIdAndDetails}
        onCancel={() => restart()}
      />
    )
  }

  if (isCreating) {
    return (
      <CreateForm
        onClickWithIdAndDetails={onIdAndDetails}
        actionCategory={actionCategory}
      />
    )
  }

  if (selectedDiscordServerId) {
    if (selectedDiscordServerData) {
      return (
        <>
          You have selected:
          <DiscordServerResultsItem
            discordServer={{
              ...selectedDiscordServerData,
            }}
            onClick={(e) => {
              e.preventDefault()
              return false
            }}
          />
          <FormControls>
            <Button onClick={() => onSave()} icon={<SaveIcon />}>
              Save
            </Button>{' '}
            <Button onClick={() => restart()} color="secondary">
              Try Again
            </Button>{' '}
            <Button onClick={() => onClear()} color="secondary">
              Clear
            </Button>
          </FormControls>
        </>
      )
    } else {
      return (
        <ErrorMessage onRetry={() => restart()}>
          There is an ID but there is no data for that Discord Server. This
          should not happen
        </ErrorMessage>
      )
    }
  }

  return (
    <>
      <SearchForIdForm
        label="Search for a Discord server"
        collectionName={CollectionNames.DiscordServers}
        renderer={SearchResultRenderer}
        onClickWithIdAndDetails={onIdAndDetails}
      />
      <br />
      <Button onClick={() => create()} icon={<AddIcon />} color="secondary">
        Add Server
      </Button>{' '}
      <Button onClick={() => browseAll()} color="secondary">
        List All Servers
      </Button>
    </>
  )
}

const ChangeDiscordServerForm = (props: FormProps) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <WarningMessage>
        Only set a Discord server if they are <strong>required</strong> to join
        it to be able to do something.
      </WarningMessage>
      <Form {...props} />
    </div>
  )
}

export default ChangeDiscordServerForm
