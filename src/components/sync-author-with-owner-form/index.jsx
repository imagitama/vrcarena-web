import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'

import {
  AuthorFieldNames,
  CollectionNames,
  UserFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'
import * as routes from '../../routes'

import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import Paper from '../paper'
import Heading from '../heading'

const useStyles = makeStyles(() => ({
  cols: {
    display: 'flex'
  },
  col: {
    width: '50%'
  }
}))

const fieldMap = [
  [UserFieldNames.bio, AuthorFieldNames.description],
  [UserFieldNames.twitterUsername, AuthorFieldNames.twitterUsername],
  [UserFieldNames.discordUsername, AuthorFieldNames.discordUsername],
  [UserFieldNames.patreonUsername, AuthorFieldNames.patreonUsername],
  [UserFieldNames.avatarUrl, AuthorFieldNames.avatarUrl]
]

export default ({ authorId, ownerId, onDone, actionCategory }) => {
  const userId = useUserId()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const titleRef = useRef()
  const [ownerFields, setOwnerFields] = useState({})
  const [newAuthorFields, setNewAuthorFields] = useState({})

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save synced author button')

      await save({
        ...newAuthorFields
      })

      onDone()
    } catch (err) {
      console.error('Failed to save author', err)
      handleError(err)
    }
  }

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save author</ErrorMessage>
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage>
        Save successful!
        <br />
        <Button url={routes.viewAuthorWithVar.replace(':authorId', authorId)}>
          View Author
        </Button>
      </SuccessMessage>
    )
  }

  return (
    <>
      <div className={classes.cols}>
        <Paper className={classes.col}>
          <Heading variant="h2">Your Profile</Heading>
        </Paper>
        <div>
          <ArrowForwardIcon />
        </div>
        <Paper className={classes.col}>
          <Heading variant="h2">Author</Heading>
        </Paper>
      </div>
      <Paper>
        <Button onClick={onSaveBtnClick}>Save</Button>
      </Paper>
    </>
  )
}
