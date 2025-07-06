import React, { useState, useEffect } from 'react'
import Markdown from '../markdown'
import { makeStyles } from '@mui/styles'
import TextField from '@mui/material/TextField'
import SaveIcon from '@mui/icons-material/Save'

import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import { User } from '../../modules/users'
import { CollectionNames } from '../../modules/user'

import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'

const useStyles = makeStyles({
  bioTextField: {
    width: '100%',
  },
  controls: {
    textAlign: 'center',
    marginTop: '0.5rem',
  },
})

const BioEditor = ({
  onSaveClick = undefined,
}: {
  onSaveClick?: () => void
}) => {
  const classes = useStyles()
  const userId = useUserId()
  const [isLoadingProfile, lastErrorCodeLoadingProfile, profile] =
    useDataStoreItem<User>(
      CollectionNames.Users,
      userId ? userId : false,
      'bio-editor'
    )
  const [isSaving, isSuccess, lastErrorCodeSaving, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )
  const [bioValue, setBioValue] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (!profile || !profile.bio) {
      return
    }
    setBioValue(profile.bio)
  }, [profile && profile.id])

  const onSaveBtnClick = async () => {
    try {
      if (onSaveClick) {
        onSaveClick()
      }

      await save({
        bio: bioValue,
      })
    } catch (err) {
      console.error('Failed to save social media fields to database', err)
      handleError(err)
    }
  }

  if (isLoadingProfile) {
    return <LoadingIndicator />
  }

  if (lastErrorCodeLoadingProfile !== null) {
    return (
      <ErrorMessage>
        Failed to lookup your user profile (code {lastErrorCodeLoadingProfile})
      </ErrorMessage>
    )
  }

  return (
    <>
      <TextField
        value={bioValue}
        onChange={(e) => setBioValue(e.target.value)}
        minRows={5}
        multiline
        variant="outlined"
        className={classes.bioTextField}
      />
      <p>
        You can use markdown to <strong>format</strong> <em>your</em> content.
        It is the same as Discord. A guide is here:{' '}
        <a
          href="https://www.markdownguide.org/basic-syntax/"
          target="_blank"
          rel="noopener noreferrer">
          Markdown
        </a>
      </p>
      {isSaving && <LoadingIndicator message="Saving..." />}
      {isSuccess ? (
        <SuccessMessage>Your bio has been saved</SuccessMessage>
      ) : lastErrorCodeSaving !== null ? (
        <ErrorMessage>
          Failed to save bio (code {lastErrorCodeSaving})
        </ErrorMessage>
      ) : null}
      {showPreview === true && <Markdown source={bioValue} />}
      <div className={classes.controls}>
        {showPreview === false && (
          <>
            <Button onClick={() => setShowPreview(true)} color="secondary">
              Show Preview
            </Button>{' '}
          </>
        )}
        <Button
          onClick={onSaveBtnClick}
          isDisabled={isSaving}
          icon={<SaveIcon />}>
          Save
        </Button>
      </div>
    </>
  )
}

export default BioEditor
