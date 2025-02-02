import { updateRecord } from '../../../data-store'
import { useBulkEdit } from '../context'
import { Asset, CollectionNames, FullAsset } from '../../../modules/assets'
import TextInput from '../../text-input'
import TagDiff from '../../tag-diff'
import { useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

export const Action = async (
  supabase: SupabaseClient,
  assetId: string,
  asset: Asset,
  newData: { all: Asset }
): Promise<void> => {
  const tagToRemove = newData.all.tags[0]

  await updateRecord(supabase, CollectionNames.Assets, assetId, {
    tags: asset.tags.filter((tag) => tag !== tagToRemove),
  })
}

export const Preview = ({ asset }: { asset: Asset }) => {
  const { newData } = useBulkEdit()

  const tagToRemove = newData.all.tags ? newData.all.tags[0] : ''

  return (
    <TagDiff
      oldTags={asset.tags}
      newTags={asset.tags.filter((tag) => tag !== tagToRemove)}
    />
  )
}

export const Form = () => {
  const { ids, newData, setNewData } = useBulkEdit()
  const [userInput, setUserInput] = useState('')

  if (!ids) {
    return null
  }

  return (
    <>
      Remove tag{' '}
      <TextInput
        value={userInput}
        onChange={(e) => {
          const newUserInput = e.target.value.trim()
          setUserInput(newUserInput)
          setNewData({
            all: {
              tags: [newUserInput],
            },
          })
        }}
        size="small"
      />{' '}
      from {ids.length} assets?
    </>
  )
}
