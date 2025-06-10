import React, { useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { Asset, CollectionNames } from '../../modules/assets'

import TagInput from '../tag-input'
import Columns from '../columns'
import Column from '../column'
import FeaturesSubEditor from '../features-sub-editor'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import FormControls from '../form-controls'
import Button from '../button'
import Heading from '../heading'

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
  const [isSaving, isSaveSuccess, lastErrorCode, save] = useDatabaseSave<Asset>(
    assetId ? CollectionNames.Assets : false,
    assetId
  )

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
      <Columns>
        <Column padding>
          <TagInput
            currentTags={newTags}
            onChange={(tags) => setNewTags(tags)}
            asset={asset}
          />
        </Column>
        <Column padding>
          <Heading variant="h3">Features:</Heading>
          <FeaturesSubEditor
            currentTags={newTags}
            onChange={(tags) => setNewTags(tags)}
          />
        </Column>
      </Columns>
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
