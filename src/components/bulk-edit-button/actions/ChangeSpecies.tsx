import { updateRecord } from '../../../data-store'
import { useBulkEdit } from '../context'
import { Asset, CollectionNames, FullAsset } from '../../../modules/assets'
import SpeciesDropdown from '../../species-dropdown'

export const Action = async (
  assetId: string,
  asset: Asset,
  newSpeciesIds: string[]
): Promise<void> => {
  await updateRecord(CollectionNames.Assets, assetId, {
    species: newSpeciesIds
  })
}

export const Preview = ({ asset }: { asset: FullAsset }) => {
  const { userInput: newSpeciesIds } = useBulkEdit()
  if (!Array.isArray(newSpeciesIds)) {
    throw new Error('User input not species IDs')
  }
  return <>{newSpeciesIds.join(', ')}</>
}

export const Form = () => {
  const { ids, userInput, setUserInput } = useBulkEdit()

  if (!ids) {
    return null
  }

  if (!Array.isArray(userInput)) {
    throw new Error('User input not species IDs')
  }

  return (
    <>
      Force new species for these assets:{' '}
      <SpeciesDropdown
        selectedSpeciesIds={userInput}
        onSpeciesClickWithId={id =>
          setUserInput(
            userInput.includes(id)
              ? userInput.filter(existingId => existingId !== id)
              : userInput.concat(id)
          )
        }
      />
    </>
  )
}
