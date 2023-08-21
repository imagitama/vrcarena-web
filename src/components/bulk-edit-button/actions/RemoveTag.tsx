import { updateRecord } from '../../../data-store'
import { useBulkEdit } from '../context'
import { Asset, CollectionNames, FullAsset } from '../../../modules/assets'
import TextInput from '../../text-input'
import TagDiff from '../../tag-diff'

export const Action = async (
  assetId: string,
  asset: Asset,
  tagToRemove: string
): Promise<void> => {
  await updateRecord(CollectionNames.Assets, assetId, {
    tags: asset.tags.filter(tag => tag !== tagToRemove)
  })
}

export const Preview = ({ asset }: { asset: FullAsset }) => {
  const { userInput: tagToRemove } = useBulkEdit()
  return (
    <TagDiff
      oldTags={asset.tags}
      newTags={asset.tags.filter(tag => tag !== tagToRemove)}
    />
  )
}

export const Form = () => {
  const { ids, userInput, setUserInput } = useBulkEdit()

  if (!ids) {
    return null
  }

  return (
    <>
      Remove tag{' '}
      <TextInput
        value={userInput}
        onChange={e => setUserInput(e.target.value.trim())}
        size="small"
      />{' '}
      from {ids.length} assets?
    </>
  )
}
