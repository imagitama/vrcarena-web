import React, { useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'
import AddIcon from '@material-ui/icons/Add'
import CheckIcon from '@material-ui/icons/Check'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  AuthorFieldNames,
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
import AuthorResults from '../author-results'
import AuthorResultsItem from '../author-results-item'
import Button from '../button'
import FormControls from '../form-controls'
import { Author } from '../../modules/authors'

const useStyles = makeStyles({
  form: {
    border: '1px solid rgba(255, 255, 255, 0.5)',
    padding: '0.5rem',
  },
  textInput: {
    width: '100%',
  },
})

const SearchResultRenderer = ({
  result,
  onClick,
}: {
  result: Author
  onClick: () => void
}) => {
  return (
    <AuthorResultsItem
      author={result}
      onClick={(e) => {
        onClick()
        e.preventDefault()
        return false
      }}
    />
  )
}

const CreateForm = ({
  onClick,
  actionCategory,
}: {
  onClick: (authorId: string, authorData: Author) => void
  actionCategory?: string
}) => {
  const [name, setName] = useState('')
  const [twitterUsername, setTwitterUsername] = useState('')
  const [gumroadUsername, setGumroadUsername] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [boothUsername, setBoothUsername] = useState('')
  const [isSaving, isSuccess, isErrored, create, clear] =
    useDatabaseSave<Author>(CollectionNames.Authors)
  const classes = useStyles()
  const [createdDocument, setCreatedDocument] = useState<Author | null>(null)

  const onCreate = async () => {
    try {
      if (actionCategory) {
        trackAction(actionCategory, 'Click create author button')
      }

      const newFields = {
        [AuthorFieldNames.name]: name,
        [AuthorFieldNames.twitterUsername]: twitterUsername,
        [AuthorFieldNames.gumroadUsername]: gumroadUsername,
        [AuthorFieldNames.websiteUrl]: websiteUrl,
        [AuthorFieldNames.boothUsername]: boothUsername,
      }

      const [document] = await create(newFields)

      if (document === null) {
        throw new Error('Newly created author is null')
      }

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
    if (!createdDocument) {
      throw new Error('Cannot call onDone without a created doc')
    }
    onClick(createdDocument.id, createdDocument)
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
      <ErrorMessage onRetry={restart}>Failed to create the author</ErrorMessage>
    )
  }

  return (
    <div className={classes.form}>
      <p>Enter the name of the author:</p>{' '}
      <TextInput
        onChange={(e) => setName(e.target.value)}
        value={name}
        className={classes.textInput}
      />
      <br />
      <p>(Optional) Enter their Twitter username (without the @ symbol):</p>
      <TextInput
        onChange={(e) => setTwitterUsername(e.target.value)}
        value={twitterUsername}
        className={classes.textInput}
      />
      <br />
      <p>(Optional) Enter their Gumroad username (eg. "xedthedead"):</p>
      <TextInput
        onChange={(e) => setGumroadUsername(e.target.value)}
        value={gumroadUsername}
        className={classes.textInput}
      />
      <br />
      <p>(Optional) Enter their Booth username (eg. "xed the dead"):</p>
      <TextInput
        onChange={(e) => setBoothUsername(e.target.value)}
        value={boothUsername}
        className={classes.textInput}
      />
      <br />
      <p>
        (Optional) Enter their website URL (eg. "https://www.mywebsite.com"):
      </p>
      <TextInput
        onChange={(e) => setWebsiteUrl(e.target.value)}
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

const AllAuthors = ({
  onClick,
  onCancel,
}: {
  onClick: (authorId: string, authorData: Author) => void
  onCancel?: () => void
}) => {
  const [isLoading, isErrored, results, hydrate] = useDatabaseQuery<Author>(
    'getpublicauthors',
    []
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Finding authors..." />
  }

  if (isErrored) {
    return (
      <ErrorMessage onOkay={onCancel} onRetry={hydrate}>
        Failed to find authors
      </ErrorMessage>
    )
  }

  return (
    <>
      <AuthorResults
        authors={results}
        onClick={(e, id, details) => {
          onClick(id, details)
          e.preventDefault()
          return false
        }}
      />
      {onCancel ? (
        <FormControls>
          <Button onClick={() => onCancel()} color="default">
            Cancel
          </Button>
        </FormControls>
      ) : null}
    </>
  )
}

const ChangeAuthorForm = ({
  collectionName,
  id,
  existingAuthorId,
  existingAuthorData,
  overrideSave,
  onDone,
  actionCategory,
}: {
  collectionName: string
  id: string
  existingAuthorId?: string | null
  existingAuthorData?: Author | null
  overrideSave?: (newValue?: string | null) => void
  onDone?: () => void
  actionCategory?: string
}) => {
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(
    existingAuthorId || null
  )
  const [selectedAuthorData, setSelectedAuthorData] = useState<Author | null>(
    existingAuthorData || null
  )
  const [isSaving, isSuccess, isErrored, save, clear] = useDatabaseSave(
    collectionName,
    id ? id : null
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

  const onIdAndDetails = (authorId: string, authorData: Author) => {
    setIsCreating(false)
    setIsBrowsingAll(false)
    setSelectedAuthorId(authorId)
    setSelectedAuthorData(authorData)
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

      if (actionCategory) {
        trackAction(actionCategory, 'Click save author button', {
          collectionName,
          id,
          authorId: newValue,
        })
      }

      await save({
        [AssetFieldNames.author]: newValue,
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
      <SuccessMessage onOkay={restart}>
        Resource has been updated with the new author
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
    return <AllAuthors onClick={onIdAndDetails} onCancel={restart} />
  }

  if (isCreating) {
    return (
      <CreateForm onClick={onIdAndDetails} actionCategory={actionCategory} />
    )
  }

  if (selectedAuthorId) {
    if (selectedAuthorData) {
      return (
        <>
          You have selected:
          <AuthorResultsItem
            author={selectedAuthorData}
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
            </Button>
          </FormControls>
        </>
      )
    } else {
      return (
        <ErrorMessage onOkay={restart}>
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
        <Button onClick={() => create()} icon={<AddIcon />} color="default">
          Create It
        </Button>
      </FormControls>
    </>
  )
}

export default ChangeAuthorForm
