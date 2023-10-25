import React, { useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'
import AddIcon from '@material-ui/icons/Add'
import CheckIcon from '@material-ui/icons/Check'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  AuthorFieldNames,
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
import AuthorResults from '../author-results'
import AuthorResultsItem from '../author-results-item'
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
    <AuthorResultsItem
      author={result}
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
  const [twitterUsername, setTwitterUsername] = useState('')
  const [gumroadUsername, setGumroadUsername] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [boothUsername, setBoothUsername] = useState('')
  const [isSaving, isSuccess, isErrored, create, clear] = useDatabaseSave(
    CollectionNames.Authors
  )
  const classes = useStyles()
  const [createdDocument, setCreatedDocument] = useState(null)

  const onCreate = async () => {
    try {
      trackAction(actionCategory, 'Click create author button')

      const newFields = {
        [AuthorFieldNames.name]: name,
        [AuthorFieldNames.twitterUsername]: twitterUsername,
        [AuthorFieldNames.gumroadUsername]: gumroadUsername,
        [AuthorFieldNames.websiteUrl]: websiteUrl,
        [AuthorFieldNames.boothUsername]: boothUsername
      }

      const [document] = await create(newFields)

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
    return <LoadingIndicator message="Creating author..." />
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        Author created successfully
        <br />
        <br />
        <Button onClick={() => onDone()}>Use the author</Button>
      </SuccessMessage>
    )
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to create the author - it is probably something internal
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
      <p>Enter the name of the author:</p>{' '}
      <TextInput
        onChange={e => setName(e.target.value)}
        value={name}
        className={classes.textInput}
      />
      <br />
      <p>(Optional) Enter their Twitter username (without the @ symbol):</p>
      <TextInput
        onChange={e => setTwitterUsername(e.target.value)}
        value={twitterUsername}
        className={classes.textInput}
      />
      <br />
      <p>(Optional) Enter their Gumroad username (eg. "xedthedead"):</p>
      <TextInput
        onChange={e => setGumroadUsername(e.target.value)}
        value={gumroadUsername}
        className={classes.textInput}
      />
      <br />
      <p>(Optional) Enter their Booth username (eg. "xed the dead"):</p>
      <TextInput
        onChange={e => setBoothUsername(e.target.value)}
        value={boothUsername}
        className={classes.textInput}
      />
      <br />
      <p>
        (Optional) Enter their website URL (eg. "https://www.mywebsite.com"):
      </p>
      <TextInput
        onChange={e => setWebsiteUrl(e.target.value)}
        value={websiteUrl}
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

const AllAuthors = ({ onClickWithIdAndDetails, onCancel }) => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    'getpublicauthors',
    []
  )

  if (isLoading) {
    return <LoadingIndicator message="Finding authors..." />
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to find authors - probably an internal error
        <br />
        <br />
        <Button onClick={() => onCancel()}>Start Again</Button>
      </ErrorMessage>
    )
  }

  return (
    <>
      <AuthorResults
        authors={results}
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
  existingAuthorId,
  existingAuthorData,
  overrideSave = null,
  onDone = null,
  actionCategory = null
}) => {
  const [selectedAuthorId, setSelectedAuthorId] = useState(existingAuthorId)
  const [selectedAuthorData, setSelectedAuthorData] = useState(
    existingAuthorData
  )
  const [isSaving, isSuccess, isErrored, save, clear] = useDatabaseSave(
    collectionName,
    id ? id : false
  )
  const [isCreating, setIsCreating] = useState(false)
  const [isBrowsingAll, setIsBrowsingAll] = useState(false)

  const restart = () => {
    setIsCreating(false)
    setIsBrowsingAll(false)
    setSelectedAuthorId(null)
    setSelectedAuthorData(null)
    clear()
  }

  const onIdAndDetails = (id, data) => {
    setIsCreating(false)
    setIsBrowsingAll(false)
    setSelectedAuthorId(id)
    setSelectedAuthorData(data)
  }

  const onSave = async () => {
    try {
      const newValue = selectedAuthorId

      if (overrideSave) {
        overrideSave(newValue)

        if (onDone) {
          onDone()
        }
        return
      }

      trackAction(actionCategory, 'Click save author button', {
        collectionName,
        id,
        authorId: newValue
      })

      await save({
        [AssetFieldNames.author]: newValue
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const create = () => setIsCreating(true)
  const browseAll = () => setIsBrowsingAll(true)

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        Resource has been updated with the new author
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
      <AllAuthors
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

  if (selectedAuthorId) {
    if (selectedAuthorData) {
      return (
        <>
          You have selected:
          <AuthorResultsItem
            author={selectedAuthorData}
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
          </FormControls>
        </>
      )
    } else {
      return (
        <ErrorMessage>
          There is an ID but there is no data for that author. This should not
          happen
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
        collectionName={CollectionNames.Authors}
        renderer={SearchResultRenderer}
        onClickWithIdAndDetails={onIdAndDetails}
      />
      <br />
      <br />
      <p>Can't find the author?</p>
      <FormControls>
        {/* <Button onClick={() => browseAll()}>Browse All</Button>{' '} */}
        <Button onClick={() => create()} icon={<AddIcon />} color="default">
          Create It
        </Button>
      </FormControls>
    </>
  )
}
