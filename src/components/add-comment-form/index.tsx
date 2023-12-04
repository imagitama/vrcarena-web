import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import TextInput, {
  ReactAutocompleteComponentProps,
} from 'react-autocomplete-input'
import 'react-autocomplete-input/dist/bundle.css'
import CreateIcon from '@material-ui/icons/Create'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import {
  CollectionNames,
  CommentFieldNames,
  UserFieldNames,
} from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'

import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'

import { handleError } from '../../error-handling'
import { simpleSearchRecords } from '../../data-store'
import FormControls from '../form-controls'
import { User } from '../../modules/users'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    marginTop: '1rem',
    '& li': {
      color: 'black',
    },
  },
  input: {
    width: '100%',
  },
  button: {
    marginTop: '0.5rem',
  },
  tagHint: {
    fontSize: '75%',
  },
})

const mapUserToRecord = (user: User): string => user.username

const TextInputComponent = React.forwardRef(
  (props: ReactAutocompleteComponentProps, ref) => {
    const classes = useStyles()
    return (
      <TextField
        inputRef={ref}
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onKeyDown={props.onKeyDown}
        multiline
        rows={2}
        variant="outlined"
        className={classes.input}
      />
    )
  }
)

export default ({
  collectionName,
  parentId,
  onAddClick = undefined,
  onDone = undefined,
  asPrivate = false,
}: {
  collectionName: string
  parentId: string
  onAddClick?: () => void
  onDone?: () => void
  asPrivate?: boolean
}) => {
  if (!collectionName) {
    throw new Error('Cannot render comment list: no collection name!')
  }
  if (!parentId) {
    throw new Error('Cannot render comment list: no parent ID')
  }

  const [textFieldValue, setTextFieldValue] = useState('')
  const userId = useUserId()
  const [isSaving, isSuccess, isErrored, create, clear] = useDatabaseSave(
    CollectionNames.Comments
  )
  const classes = useStyles()
  const timeoutRef = useRef<NodeJS.Timeout | undefined>()
  const [autoCompleteOptions, setAutoCompleteOptions] = useState<string[]>([])

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    },
    []
  )

  const populateAutoCompleteOptions = async (searchTerm: string) => {
    try {
      console.debug(`Populate auto complete!`)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (!searchTerm) {
        return
      }

      await new Promise((resolve) => {
        timeoutRef.current = setTimeout(resolve, 250)
      })

      const data = await simpleSearchRecords<User>(
        CollectionNames.Users,
        { [UserFieldNames.username]: searchTerm },
        10
      )

      if (!data) {
        throw new Error('Simple search returned null')
      }

      const newRecords = data.map(mapUserToRecord)

      setAutoCompleteOptions((currentRecords) =>
        currentRecords
          .filter((currentRecord) => !newRecords.includes(currentRecord))
          .concat(newRecords)
      )
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (!userId) {
    return (
      <FormControls>
        <Button size="large" icon={<CreateIcon />} isDisabled>
          Log in to comment
        </Button>
      </FormControls>
    )
  }

  if (isSaving) {
    return <LoadingIndicator message="Adding your comment..." />
  }

  if (isSuccess) {
    return <SuccessMessage>Added your comment successfully</SuccessMessage>
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Error adding your comment
        <br />
        <br />
        <Button onClick={() => clear()}>Try Again</Button>
      </ErrorMessage>
    )
  }

  const onAddCommentBtnClick = async () => {
    try {
      if (onAddClick) {
        onAddClick()
      }

      await create({
        [CommentFieldNames.parentTable]: collectionName,
        [CommentFieldNames.parent]: parentId,
        [CommentFieldNames.comment]: textFieldValue,
        [CommentFieldNames.isPrivate]: asPrivate,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to add comment', err)
      handleError(err)
    }
  }

  return (
    <div className={classes.root}>
      <TextInput
        Component={TextInputComponent}
        value={textFieldValue}
        onChange={(newVal) => setTextFieldValue(newVal)}
        options={autoCompleteOptions}
        onRequestOptions={populateAutoCompleteOptions}
        matchAny
      />
      <div className={classes.tagHint}>
        Use @ to mention another user (notifies them)
      </div>
      <Button className={classes.button} onClick={onAddCommentBtnClick}>
        Add{asPrivate ? ' Private' : ''} Comment
      </Button>
    </div>
  )
}
