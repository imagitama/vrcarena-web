import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import SaveIcon from '@material-ui/icons/Save'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'

import {
  CollectionNames,
  UserFieldNames,
  SpeciesFieldNames,
} from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import FormControls from '../form-controls'
import Select from '../select'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import useUserRecord from '../../hooks/useUserRecord'
import { GetFullUsersFieldNames } from '../../data-store'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
  },
}))

export default ({
  analyticsCategory,
  onDone = undefined,
  saveOnSelect = false,
}) => {
  const classes = useStyles()
  const userId = useUserId()
  const [isLoadingUser, isErroredLoadingUser, user] = useUserRecord()
  const [isLoadingSpecies, isErroredLoadingSpecies, species] =
    useDataStoreItems(CollectionNames.Species, undefined, {
      queryName: 'favorite-species-editor-species',
      orderBy: SpeciesFieldNames.pluralName,
    })
  const [isSaving, isSaveSuccess, isSaveErrored, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )
  const [newFavoriteSpeciesId, setNewFavoriteSpeciesId] = useState(null)

  useEffect(() => {
    if (!user) {
      return
    }

    setNewFavoriteSpeciesId(
      user[GetFullUsersFieldNames.favoriteSpeciesData]
        ? user[GetFullUsersFieldNames.favoriteSpeciesData].id
        : null
    )
  }, [user && user.id])

  const onSaveBtnClick = async (overrideSpeciesId) => {
    try {
      trackAction(
        analyticsCategory,
        'Click save favorite species',
        newFavoriteSpeciesId
      )

      const speciesIdToUse = overrideSpeciesId || newFavoriteSpeciesId || false

      console.debug(`save fav species id ${speciesIdToUse}`)

      await save({
        [UserFieldNames.favoriteSpecies]: speciesIdToUse
          ? createRef(CollectionNames.Species, speciesIdToUse)
          : null,
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
            const newSpeciesId = e.target.value
            setNewFavoriteSpeciesId(newSpeciesId)

            trackAction(
              analyticsCategory,
              'Select different species',
              e.target.value
            )

            if (saveOnSelect) {
              onSaveBtnClick(newSpeciesId)
            }
          }}>
          {species.map((speciesDoc) => (
            <MenuItem key={speciesDoc.id} value={speciesDoc.id}>
              {speciesDoc[SpeciesFieldNames.singularName]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {saveOnSelect !== true && (
        <FormControls>
          <Button
            onClick={() => onSaveBtnClick()}
            isDisabled={isSaving}
            icon={<SaveIcon />}>
            Save
          </Button>{' '}
          {isSaving
            ? 'Saving...'
            : isSaveSuccess
            ? ' Saved!'
            : isSaveErrored
            ? ' Error'
            : ''}
        </FormControls>
      )}
    </div>
  )
}
