import { updateRecord } from '../../../data-store'
import { useBulkEdit } from '../context'
import { Asset, CollectionNames } from '../../../modules/assets'
import SpeciesDropdown from '../../species-dropdown'
import { useEffect } from 'react'

export const Action = async (
  assetId: string,
  asset: Asset,
  newData: { [assetId: string]: Asset }
): Promise<void> => {
  const newSpecies = newData[assetId].species
  console.log('ACTION - CHANGE SPECIES', assetId, asset, newData, newSpecies)
  await updateRecord(CollectionNames.Assets, assetId, {
    species: newSpecies
  })
}

export const Preview = ({ asset }: { asset: Asset }) => {
  const { newData } = useBulkEdit()

  const newSpeciesIds = (newData[asset.id] || {}).species || []

  return <>{(newSpeciesIds || []).join(', ')}</>
}

export const FormPerAsset = ({ asset }: { asset: Asset }) => {
  const { ids, newData, setNewData } = useBulkEdit()

  const newSpeciesIds = (newData[asset.id] || {}).species || []

  if (!ids) {
    return null
  }

  const toggleSpeciesId = (speciesId: string) =>
    setNewData({
      ...newData,
      [asset.id]: {
        species: newSpeciesIds.includes(speciesId)
          ? newSpeciesIds.filter(id => id !== speciesId)
          : newSpeciesIds.concat(speciesId)
      }
    })

  return (
    <>
      Change species:
      <SpeciesDropdown
        selectedSpeciesIds={newSpeciesIds}
        onSpeciesClickWithId={id => toggleSpeciesId(id)}
      />
    </>
  )
}
