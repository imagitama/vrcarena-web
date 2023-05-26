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
import SpeciesVsSelector from '../species-vs-selector'
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
    <SpeciesVsSelector
      selectedSpeciesIds={activeSpeciesIds}
      onSpeciesClickWithId={(id: string) => onClickSpecies(id)}
      horizontalTitles
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
        <p>
          We recommend that you follow "tag what you see" or in other words if
          it looks like a species then it probably is that species. If it looks
          like a rabbit (and doesn't have its own species) then it is a rabbit.
        </p>
        <ul>
          <li>
            if your asset applies to ALL species (such as an accessory like a
            hat) then do not select ANY species
          </li>
          <li>
            if your avatar uses a base model of a completely different species
            do NOT use that species - tag what you SEE
          </li>
        </ul>
        <Heading variant="h3">What about an accessory?</Heading>
        <p>
          Try your best to match the accessory to the parent avatar's species.
          eg. the Canis Wolf by Rezillo Ryker has wolf, dog, hyena so some
          clothing for it would also have wolf, dog, hyena.
        </p>
        <Heading variant="h3">What about tool, world assets, etc.?</Heading>
        <p>
          It isn't very important but try your best if the asset has any species
          in it.
        </p>
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
