import { updateRecord } from '../../../data-store'
import { useBulkEdit } from '../context'
import { Asset, CollectionNames, FullAsset } from '../../../modules/assets'
import TextInput from '../../text-input'
import TagDiff from '../../tag-diff'

export const Action = async (
  assetId: string,
  asset: Asset,
  tagToAdd: string
): Promise<void> => {
  if (asset.tags.includes(tagToAdd)) {
    return
  }
  await updateRecord(CollectionNames.Assets, assetId, {
    tags: asset.tags.concat([tagToAdd])
  })
}

export const Preview = ({ asset }: { asset: FullAsset }) => {
  const { userInput: tagToAdd } = useBulkEdit()
  if (Array.isArray(tagToAdd)) {
    throw new Error('User input not string')
  }
  return (
    <TagDiff
      oldTags={asset.tags}
      newTags={
        asset.tags.includes(tagToAdd)
          ? asset.tags
          : asset.tags.concat([tagToAdd])
      }
    />
  )
}

export const Form = () => {
  const { ids, userInput, setUserInput } = useBulkEdit()

  if (!ids) {
    return null
  }

  if (Array.isArray(userInput)) {
    throw new Error('User input not string')
  }

  return (
    <>
      Add tag{' '}
      <TextInput
        value={userInput}
        onChange={e => setUserInput(e.target.value.trim())}
        size="small"
      />{' '}
      from {ids.length} assets?
    </>
  )
}
