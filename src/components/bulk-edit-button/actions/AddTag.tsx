import React from 'react'
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
  const tagToAdd = newData.all.tags[0]

  if (asset.tags.includes(tagToAdd)) {
    return
  }

  await updateRecord(supabase, CollectionNames.Assets, assetId, {
    tags: asset.tags.concat([tagToAdd]),
  })
}

export const Preview = ({ asset }: { asset: Asset }) => {
  const { newData } = useBulkEdit()

  const tagToAdd = newData.all.tags ? newData.all.tags[0] : ''

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
  const { ids, setNewData } = useBulkEdit()
  const [userInput, setUserInput] = useState('')

  if (!ids) {
    return null
  }

  return (
    <>
      Add tag{' '}
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
