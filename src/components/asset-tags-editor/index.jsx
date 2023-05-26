import React from 'react'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'

import TagInput from '../tag-input'

export default ({
  assetId,
  tags = [],
  onDone,
  actionCategory,
  overrideSave = null,
  categoryName = null
}) => {
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  const onSaveBtnClick = async newTags => {
    try {
      if (overrideSave) {
        overrideSave(newTags)
        onDone()
        return
      }

      trackAction(actionCategory, 'Click save asset tags', assetId)

      await save({
        [AssetFieldNames.tags]: newTags
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
        onDone={newTags => onSaveBtnClick(newTags)}
        categoryName={categoryName}
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
