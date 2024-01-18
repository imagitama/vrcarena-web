import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import SaveIcon from '@material-ui/icons/Save'

import {
  AssetFieldNames,
  CollectionNames,
  UserFieldNames,
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserRecord from '../../hooks/useUserRecord'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import * as routes from '../../routes'
import { WEBSITE_FULL_URL } from '../../config'
import { client as supabase } from '../../supabase'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import EditorControls from '../editor-controls'
import SuccessMessage from '../success-message'

const useStyles = makeStyles(() => ({
  input: {
    width: '100%',
  },
  demo: {
    textDecoration: 'underline',
  },
  saveBtn: {
    cursor: 'pointer',
  },
}))

// regex: https://stackoverflow.com/a/51365309/1215393
const validateSlug = (slug) =>
  /^[a-z](-?[a-z])*$/g.test(slug) && slug.length < 20 && slug.length >= 3

const ERRORS = {
  TAKEN: 'TAKEN',
  SPECIES_NAME_CONFLICT: 'SPECIES_NAME_CONFLICT',
  INVALID: 'INVALID',
  UNCHANGED: 'UNCHANGED',
  EMPTY: 'EMPTY',
}

const getErrorIfSlugIsTaken = async (slug) => {
  const { data: assetsWithSlug } = await supabase
    .from(CollectionNames.Assets)
    .select(AssetFieldNames.slug)
    .eq(AssetFieldNames.slug, slug)

  if (assetsWithSlug.length !== 0) {
    return ERRORS.TAKEN
  }

  return false
}

function Error({ error }) {
  switch (error) {
    case ERRORS.TAKEN:
      return 'That slug has already been taken by another asset'
    case ERRORS.SPECIES_NAME_CONFLICT:
      return 'You cannot use the name of a species as a slug'
    case ERRORS.INVALID:
      return 'The slug contains invalid characters (see rules)'
    case ERRORS.UNCHANGED:
      return 'Has not changed'
    case ERRORS.EMPTY:
      return 'Nothing provided'
    default:
      return 'Unknown error'
  }
}

export default ({
  assetId,
  slug,
  onDone,
  actionCategory,
  overrideSave = null,
}) => {
  const [newSlugValue, setNewSlugValue] = useState(slug)
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const [error, setError] = useState(false)
  const [, , user] = useUserRecord()
  const [hasConfirmed, setHasConfirmed] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const onSaveBtnClick = async () => {
    try {
      if (overrideSave) {
        overrideSave(newSlugValue)
        onDone()
        return
      }

      trackAction(actionCategory, 'Click save slug button', assetId)

      await save({
        [AssetFieldNames.slug]: newSlugValue,
      })

      onDone()
    } catch (err) {
      console.error('Failed to save slug', err)
      handleError(err)
    }
  }

  const onNextBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click slug next button', assetId)

      if (!newSlugValue) {
        setError(ERRORS.EMPTY)
        return
      }

      if (!validateSlug(newSlugValue)) {
        setError(ERRORS.INVALID)
        return
      }

      if (newSlugValue === slug) {
        setError(ERRORS.UNCHANGED)
        return
      }

      setIsLoading(true)

      const errorIfTaken = await getErrorIfSlugIsTaken(newSlugValue)

      setIsLoading(false)

      if (errorIfTaken) {
        setError(errorIfTaken)
        return
      }

      setHasConfirmed(false)
    } catch (err) {
      console.error('Failed to process with slug', err)
      handleError(err)
    }
  }

  const NewSlugValueOutput = () => (
    <span className={classes.demo}>
      {WEBSITE_FULL_URL}
      {routes.viewAssetWithVar.replace(':assetId', newSlugValue)}
    </span>
  )

  if (hasConfirmed === false) {
    return (
      <>
        <p>
          <strong>Are you sure you want to use this slug?</strong>
        </p>
        <p>
          <NewSlugValueOutput />
        </p>
        <p>
          You cannot change the slug after you have saved it without contacting
          a staff member.
        </p>
        <EditorControls>
          <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
            Confirm and Save
          </Button>
        </EditorControls>
      </>
    )
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving slug..." />
  }

  if (isLoading) {
    return <LoadingIndicator message="Validating slug..." />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save</ErrorMessage>
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Saved!</SuccessMessage>
  }

  if (slug && !user[UserFieldNames.isAdmin]) {
    return (
      <ErrorMessage>
        You cannot change a slug once you have saved it. Please contact a staff
        member on our Discord (see icon in header) to change it
      </ErrorMessage>
    )
  }

  return (
    <>
      {newSlugValue ? <NewSlugValueOutput /> : '(no slug yet)'}
      <br />
      <br />
      These are the rules for custom slugs:
      <ul>
        <li>all lowercase</li>
        <li>letters and single dashes only</li>
        <li>cannot start or end with a dash</li>
        <li>
          more than 2 characters but <strong>less than 19 characters</strong>
        </li>
        <li>cannot be the name of a species (eg. "wolf" or "fox")</li>
      </ul>
      <strong>
        If you do not follow these rules then your asset will break
      </strong>
      <br />
      <br />
      <strong>Enter a new slug:</strong>
      <TextField
        className={classes.input}
        value={newSlugValue}
        onChange={(e) => {
          setError(null)
          setNewSlugValue(e.target.value)
        }}
        variant="filled"
      />
      {error && <Error error={error} />}
      <EditorControls>
        <Button onClick={onNextBtnClick}>Next</Button>
      </EditorControls>
    </>
  )
}
