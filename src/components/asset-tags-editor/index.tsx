import React from 'react'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import TagInput from '../tag-input'
import { Asset } from '../../modules/assets'

const AssetTagsEditor = ({
  assetId,
  tags = [],
  onDone,
  actionCategory,
  overrideSave,
  asset,
}: {
  assetId: string | null
  tags: string[]
  onDone?: () => void
  overrideSave?: (newTags: string[]) => void
  actionCategory?: string
  asset?: Asset
}) => {
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    assetId ? CollectionNames.Assets : false,
    assetId
  )

  const onSaveBtnClick = async (newTags: string[]) => {
    try {
      if (overrideSave) {
        overrideSave(newTags)

        if (onDone) {
          onDone()
        }
        return
      }

      if (actionCategory) {
        trackAction(actionCategory, 'Click save asset tags', assetId)
      }

      await save({
        [AssetFieldNames.tags]: newTags,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset tags', err)
      handleError(err)
    }
  }

  return (
    <>
      <TagInput
        currentTags={tags || []}
        onDone={(newTags) => onSaveBtnClick(newTags)}
        asset={asset}
      />
      {isSaving
        ? 'Saving...'
        : isSaveSuccess
        ? 'Success!'
        : isSaveError
        ? 'Error'
        : null}
    </>
  )
}

export default AssetTagsEditor
