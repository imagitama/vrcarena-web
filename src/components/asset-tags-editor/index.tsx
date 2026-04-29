import React, { useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import { handleError } from '@/error-handling'
import { trackAction } from '@/analytics'
import { Asset, CollectionNames } from '@/modules/assets'

import TagInput from '@/components/tag-input'
import LoadingIndicator from '@/components/loading-indicator'
import SuccessMessage from '@/components/success-message'
import ErrorMessage from '@/components/error-message'
import FormControls from '@/components/form-controls'
import Button from '@/components/button'

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
  const [newTags, setNewTags] = useState(tags || [])
  const [isSaving, isSaveSuccess, lastErrorCode, save] =
    useDataStoreEdit<Asset>(CollectionNames.Assets, assetId || false)

  const onSaveBtnClick = async () => {
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
        tags: newTags,
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
      <FormControls>
        <Button onClick={onSaveBtnClick} size="large" icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
      {isSaving ? (
        <LoadingIndicator message="Saving tags..." />
      ) : isSaveSuccess ? (
        <SuccessMessage>Tags saved successfully</SuccessMessage>
      ) : lastErrorCode !== null ? (
        <ErrorMessage>Failed to save (code {lastErrorCode})</ErrorMessage>
      ) : null}
      <div>
        <TagInput
          currentTags={newTags}
          onChange={(tags) => setNewTags(tags)}
          asset={asset}
        />
      </div>
      {isSaving ? (
        <LoadingIndicator message="Saving tags..." />
      ) : isSaveSuccess ? (
        <SuccessMessage>Tags saved successfully</SuccessMessage>
      ) : lastErrorCode !== null ? (
        <ErrorMessage>Failed to save (code {lastErrorCode})</ErrorMessage>
      ) : null}
      <FormControls>
        <Button onClick={onSaveBtnClick} size="large" icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
    </>
  )
}

export default AssetTagsEditor
