import React, { useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'
import AddIcon from '@material-ui/icons/Add'
import CheckIcon from '@material-ui/icons/Check'
import { makeStyles } from '@material-ui/core/styles'

import {
  CollectionNames,
  DiscordServerFieldNames,
  AssetFieldNames,
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import TextInput from '../text-input'
import SearchForIdForm from '../search-for-id-form'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import DiscordServerResults from '../discord-server-results'
import DiscordServerResultsItem from '../discord-server-results-item'
import Button from '../button'
import FormControls from '../form-controls'
import {
  DiscordServer,
  DiscordServerFields,
  ViewNames,
} from '../../modules/discordservers'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'
import { Asset, AssetFields, DiscordServerData } from '../../modules/assets'

const useStyles = makeStyles((theme) => ({
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
  const [isSaving, isSuccess, isErrored, create, clear] =
    useDataStoreCreate<DiscordServer>(CollectionNames.DiscordServers)
  const [createdDocument, setCreatedDocument] = useState<DiscordServer | null>(
    null
  )

  const onCreate = async () => {
    try {
      if (actionCategory) {
        trackAction(actionCategory, 'Click create Discord Server button')
      }

      const justCreatedDocument = await create(
        {
          name,
          inviteurl: inviteUrl,
          widgetid: widgetId,
        },
        true
      )

      if (typeof justCreatedDocument !== 'string') {
        setCreatedDocument(justCreatedDocument)
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const restart = () => {
    clear()
  }

  const onDone = () => {
    if (!createdDocument) {
      throw new Error('Cannot onDone without a created document')
    }
    onClickWithIdAndDetails(createdDocument.id, createdDocument)
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

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to create the Discord Server - it is probably something internal
        <br />
        <br />
        <Button onClick={() => restart()} color="default">
          Start Again
        </Button>
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
  const [isLoading, isErrored, results] = useDataStoreItems<DiscordServer>(
    ViewNames.GetPublicDiscordServers,
    undefined,
    { queryName: 'get-discord-servers-for-form' }
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Finding Discord Servers..." />
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to find Discord Servers - probably an internal error
        <br />
        <br />
        <Button onClick={() => onCancel()}>Start Again</Button>
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
        <Button onClick={() => onCancel()} color="default">
          Cancel
        </Button>
      </FormControls>
    </>
  )
}

interface FormProps {
  collectionName?: string
  id?: string
  existingDiscordServerId?: string
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
    string | undefined
  >(existingDiscordServerId)
  const [selectedDiscordServerData, setSelectedDiscordServerData] = useState<
    DiscordServerData | undefined
  >(existingDiscordServerData)
  const [isSaving, isSuccess, isErrored, save, clear] = useDatabaseSave<AssetFields>(
    collectionName || false,
    id
  )
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

  const onSave = async (overrideValue: string | null) => {
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
      <SuccessMessage>
        Resource has been updated with Discord Server notice
        <br />
        <br />
        <Button onClick={() => restart()} color="default">
          Okay
        </Button>
      </SuccessMessage>
    )
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to save the resource - do you have permission?
        <br />
        <br />
        <Button onClick={() => restart()} color="default">
          Start Again
        </Button>
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
              id: selectedDiscordServerId,
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
            <Button onClick={() => restart()} color="default">
              Try Again
            </Button>{' '}
            <Button onClick={() => onClear()} color="default">
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
      <Button onClick={() => create()} icon={<AddIcon />} color="default">
        Add Server
      </Button>{' '}
      <Button onClick={() => browseAll()} color="default">
        List All Servers
      </Button>
    </>
  )
}

const ChangeDiscordServerForm = (props: FormProps) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <Form {...props} />
    </div>
  )
}

export default ChangeDiscordServerForm
