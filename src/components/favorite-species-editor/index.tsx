import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import MenuItem from '@mui/material/MenuItem'
import SaveIcon from '@mui/icons-material/Save'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

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
import { VRCArenaTheme } from '../../themes'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
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
  const [isLoadingUser, isErrorLoadingUser, user] = useUserRecord()
  const [isLoadingSpecies, lastErrorCodeLoadingSpecies, species] =
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

  if (isErrorLoadingUser) {
    return <ErrorMessage>Failed to lookup your profile</ErrorMessage>
  }

  if (lastErrorCodeLoadingSpecies !== null) {
    return (
      <ErrorMessage>
        Failed to load species (code {lastErrorCodeLoadingSpecies})
      </ErrorMessage>
    )
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
          {species
            .filter(
              (speciesItem) => !speciesItem.singularname.includes('DO NOT USE')
            )
            .map((speciesItem) => (
              <MenuItem key={speciesItem.id} value={speciesItem.id}>
                {speciesItem.pluralname}
                {speciesItem.singularname !== speciesItem.pluralname
                  ? `/${speciesItem.singularname}`
                  : ''}

                {speciesItem.tags.length
                  ? ` (${speciesItem.tags.join(', ')})`
                  : ''}
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
