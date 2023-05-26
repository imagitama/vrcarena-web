import React, { useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'
import AddIcon from '@material-ui/icons/Add'
import CheckIcon from '@material-ui/icons/Check'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  DiscordServerFieldNames,
  AssetFieldNames
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

const useStyles = makeStyles({
  form: {
    border: '1px solid rgba(255, 255, 255, 0.5)',
    padding: '0.5rem'
  },
  textInput: {
    width: '100%'
  }
})

const SearchResultRenderer = ({ result, onClick }) => {
  return (
    <DiscordServerResultsItem
      discordServer={result}
      onClick={e => {
        onClick()
        e.preventDefault()
        return false
      }}
    />
  )
}

const CreateForm = ({ onClickWithIdAndDetails, actionCategory }) => {
  const [name, setName] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [widgetId, setWidgetId] = useState('')
  const [isSaving, isSuccess, isErrored, create, clear] = useDatabaseSave(
    CollectionNames.DiscordServers
  )
  const classes = useStyles()
  const [createdDocument, setCreatedDocument] = useState(null)

  const onCreate = async () => {
    try {
      trackAction(actionCategory, 'Click create Discord Server button')

      const newFields = {
        [DiscordServerFieldNames.name]: name,
        [DiscordServerFieldNames.inviteUrl]: inviteUrl,
        [DiscordServerFieldNames.widgetId]: widgetId
      }

      const document = await create(newFields)

      setCreatedDocument(document)
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const restart = () => {
    clear()
  }

  const onDone = () => {
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
    <div className={classes.form}>
      <p>Enter the name of the Discord server:</p>{' '}
      <TextInput
        onChange={e => setName(e.target.value)}
        value={name}
        className={classes.textInput}
      />
      <br />
      <p>Enter the invite URL (ensure it does not expire):</p>
      <TextInput
        onChange={e => setInviteUrl(e.target.value)}
        value={inviteUrl}
        className={classes.textInput}
      />
      <br />
      <p>
        (Optional) If possible enable the widget and paste the widget ID here so
        we can try and populate the data automatically:
      </p>
      <TextInput
        onChange={e => setWidgetId(e.target.value)}
        value={widgetId}
        className={classes.textInput}
      />
      <FormControls>
        <Button onClick={() => onCreate()} icon={<CheckIcon />}>
          Create
        </Button>
      </FormControls>
    </div>
  )
}

const AllDiscordServers = ({ onClickWithIdAndDetails, onCancel }) => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    'getpublicdiscordservers',
    []
  )

  if (isLoading) {
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

export default ({
  collectionName,
  id,
  existingDiscordServerId,
  existingDiscordServerData,
  overrideSave = null,
  onDone = null,
  actionCategory = null
}) => {
  if (!collectionName) {
    throw new Error('Cannot change discord server without collection name!')
  }
  if (!id) {
    throw new Error('Cannot change discord server without ID!')
  }

  const [selectedDiscordServerId, setSelectedDiscordServerId] = useState(
    existingDiscordServerId
  )
  const [selectedDiscordServerData, setSelectedDiscordServerData] = useState(
    existingDiscordServerData
  )
  const [isSaving, isSuccess, isErrored, save, clear] = useDatabaseSave(
    collectionName,
    id
  )
  const [isCreating, setIsCreating] = useState(false)
  const [isBrowsingAll, setIsBrowsingAll] = useState(false)

  const restart = () => {
    setIsCreating(false)
    setIsBrowsingAll(false)
    setSelectedDiscordServerId(null)
    setSelectedDiscordServerData(null)
    clear()
  }

  const onIdAndDetails = (id, data) => {
    setIsCreating(false)
    setIsBrowsingAll(false)
    setSelectedDiscordServerId(id)
    setSelectedDiscordServerData(data)
  }

  const onSave = async (overrideValue = undefined) => {
    try {
      const newValue =
        overrideValue !== undefined ? overrideValue : selectedDiscordServerId

      if (overrideSave) {
        overrideSave(newValue)

        if (onDone) {
          onDone()
        }
        return
      }

      trackAction(actionCategory, 'Click save Discord Server button', {
        collectionName,
        id,
        discordServerId: newValue
      })

      await save({
        [AssetFieldNames.discordServer]: newValue
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
        actionCategory={actionCategory}
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
            discordServer={selectedDiscordServerData}
            onClick={e => {
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
            </Button>
            <Button onClick={() => onClear()} color="default">
              Clear
            </Button>
          </FormControls>
        </>
      )
    } else {
      return (
        <ErrorMessage>
          There is an ID but there is no data for that Discord Server. This
          should not happen
          <br />
          <br />
          <Button onClick={() => restart()}>Start Again</Button>
        </ErrorMessage>
      )
    }
  }

  return (
    <>
      <SearchForIdForm
        indexName={CollectionNames.DiscordServers}
        renderer={SearchResultRenderer}
        onDone={onIdAndDetails}
      />
      <br />
      <br />
      <p>Can't find the Discord Server?</p>
      <FormControls>
        <Button onClick={() => browseAll()}>Browse All</Button>{' '}
        <Button onClick={() => create()} icon={<AddIcon />} color="default">
          Create It
        </Button>
      </FormControls>
    </>
  )
}
