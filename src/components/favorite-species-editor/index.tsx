import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import SaveIcon from '@material-ui/icons/Save'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'

import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import FormControls from '../form-controls'
import Select from '../select'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import useUserRecord from '../../hooks/useUserRecord'
import {
  Species,
  CollectionNames as SpeciesCollectionNames,
} from '../../modules/species'
import {
  User,
  CollectionNames as UsersCollectionNames,
} from '../../modules/users'
import SuccessMessage from '../success-message'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
  },
}))

export default ({
  analyticsCategory,
  onDone = undefined,
  saveOnSelect = false,
}: {
  analyticsCategory?: string
  onDone?: () => void
  saveOnSelect?: boolean
}) => {
  const classes = useStyles()
  const userId = useUserId()
  const [isLoadingUser, isErroredLoadingUser, user] = useUserRecord()
  const [isLoadingSpecies, isErroredLoadingSpecies, species] =
    useDataStoreItems<Species>(SpeciesCollectionNames.Species, undefined, {
      queryName: 'favorite-species-editor-species',
      orderBy: 'pluralname',
    })
  const [isSaving, isSaveSuccess, lastErrorCode, save] = useDatabaseSave<User>(
    UsersCollectionNames.Users,
    userId
  )
  const [newFavoriteSpeciesId, setNewFavoriteSpeciesId] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (!user) {
      return
    }

    setNewFavoriteSpeciesId(
      user.favoritespeciesdata ? user.favoritespeciesdata.id : null
    )
  }, [user && user.id])

  const onSaveBtnClick = async (overrideSpeciesId?: string) => {
    try {
      if (analyticsCategory) {
        trackAction(
          analyticsCategory,
          'Click save favorite species',
          newFavoriteSpeciesId
        )
      }

      const speciesIdToUse = overrideSpeciesId || newFavoriteSpeciesId || false

      console.debug(`save fav species id ${speciesIdToUse}`)

      await save({
        favoritespecies: speciesIdToUse ? speciesIdToUse : null,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save fav species to database', err)
      handleError(err)
    }
  }

  if (isLoadingUser || isLoadingSpecies || !species) {
    return <LoadingIndicator message="Loading species..." />
  }

  if (isErroredLoadingUser) {
    return <ErrorMessage>Failed to lookup your profile</ErrorMessage>
  }

  if (isErroredLoadingSpecies) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  return (
    <div>
      <FormControl fullWidth variant="outlined" className={classes.formControl}>
        <InputLabel id="fav-species-label">
          Select your favorite species (optional)
        </InputLabel>
        <Select
          fullWidth
          labelId="fav-species-label"
          value={newFavoriteSpeciesId}
          onChange={(e) => {
            const newSpeciesId = e.target.value as string
            setNewFavoriteSpeciesId(newSpeciesId)

            if (analyticsCategory) {
              trackAction(
                analyticsCategory,
                'Select different species',
                e.target.value
              )
            }

            if (saveOnSelect) {
              onSaveBtnClick(newSpeciesId)
            }
          }}>
          {species.map((speciesDoc) => (
            <MenuItem key={speciesDoc.id} value={speciesDoc.id}>
              {speciesDoc.singularname}
            </MenuItem>
          ))}
        </Select>
        {isSaving && <LoadingIndicator message="Saving..." />}
        {isSaveSuccess ? (
          <SuccessMessage>Your favorite species has been saved</SuccessMessage>
        ) : lastErrorCode ? (
          <ErrorMessage>Failed to save (code {lastErrorCode})</ErrorMessage>
        ) : null}
      </FormControl>
      {saveOnSelect !== true && (
        <FormControls>
          <Button
            onClick={() => onSaveBtnClick()}
            isDisabled={isSaving}
            icon={<SaveIcon />}>
            Save
          </Button>
        </FormControls>
      )}
    </div>
  )
}
