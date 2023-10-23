import React, { useEffect, useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'

import Button from '../button'
import FormControls from '../form-controls'

import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import SpeciesSelector from '../species-selector'
import { Asset } from '../../modules/assets'
import Heading from '../heading'
import Message from '../message'

function isSpeciesIdActive(
  speciesId: string,
  activeSpeciesIds: string[]
): boolean {
  return activeSpeciesIds.includes(speciesId)
}

function SpeciesButtons({
  activeSpeciesIds,
  onClickSpecies
}: {
  activeSpeciesIds: string[]
  onClickSpecies: (id: string) => void
}): React.ReactElement {
  return (
    <SpeciesSelector
      selectedSpeciesIds={activeSpeciesIds}
      onSpeciesClickWithId={(id: string) => onClickSpecies(id)}
    />
  )
}

// TODO: Save one query by providing the existing species to this component
export default ({
  assetId,
  activeSpeciesIds = undefined,
  actionCategory = undefined,
  onDone = undefined,
  onCancel = undefined,
  overrideSave = undefined
}: {
  assetId?: string
  activeSpeciesIds?: string[]
  actionCategory?: string
  onDone?: () => void
  onCancel?: () => void
  overrideSave?: (newSpeciesIds: string[]) => void
}) => {
  const userId = useUserId()
  const [isLoading, isError, asset] = useDataStoreItem<Asset>(
    CollectionNames.Assets,
    activeSpeciesIds ? false : assetId ? assetId : false,
    'change-species-editor'
  )
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const [newSpeciesIds, setNewSpeciesIds] = useState<string[]>(
    activeSpeciesIds || []
  )

  useEffect(() => {
    if (!asset || activeSpeciesIds) {
      return
    }

    setNewSpeciesIds(asset.species || [])
  }, [asset !== null])

  if (!userId) {
    return <>You are not logged in</>
  }

  if (isLoading || !newSpeciesIds) {
    return <>Loading asset...</>
  }

  if (isError || (!activeSpeciesIds && !asset)) {
    return <>Error loading resource</>
  }

  if (isSaving) {
    return <>Saving...</>
  }

  if (isSuccess) {
    return <>Species has been changed</>
  }

  if (isFailed) {
    return <>Error saving new species</>
  }

  const onClickSpecies = (speciesId: string) =>
    setNewSpeciesIds(currentIds =>
      isSpeciesIdActive(speciesId, newSpeciesIds)
        ? currentIds.filter(id => id !== speciesId)
        : currentIds.concat([speciesId])
    )

  const onSaveBtnClick = async () => {
    try {
      if (overrideSave) {
        overrideSave(newSpeciesIds)

        if (onDone) {
          onDone()
        }
        return
      }

      if (actionCategory) {
        trackAction(actionCategory, 'Click save change species button', assetId)
      }

      await save({
        [AssetFieldNames.species]: newSpeciesIds
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      <Message>
        <Heading variant="h2" noTopMargin>
          How do I pick a species?
        </Heading>
        <ul>
          <li>
            tag what you SEE - does the avatar contain a texture for a different
            species? Tag it!
          </li>
          <li>
            selecting a parent will automatically select all of the children
          </li>
        </ul>
      </Message>
      <SpeciesButtons
        activeSpeciesIds={newSpeciesIds}
        onClickSpecies={onClickSpecies}
      />
      <FormControls>
        <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
          Save
        </Button>{' '}
        {onCancel && (
          <Button onClick={() => onCancel()} color="default">
            Cancel
          </Button>
        )}
      </FormControls>
    </>
  )
}
