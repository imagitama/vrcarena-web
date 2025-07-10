import React, { useState } from 'react'
import { handleError } from '../../error-handling'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import Button from '../button'
import CheckboxInput from '../checkbox-input'
import ErrorMessage from '../error-message'
import FormControls from '../form-controls'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import { Asset, CollectionNames } from '../../modules/assets'

const publicAvatarsBannedTag = 'public_avatars_banned'

export default ({
  assetId,
  tags,
  overrideSave = undefined,
  onDone,
}: {
  assetId: string
  tags: string[]
  overrideSave?: (newTags: string[]) => void
  onDone: () => void
}) => {
  const [newTags, setNewTags] = useState<string[]>(tags)
  const [isSaving, isSaveSuccess, isSaveError, save] = useDataStoreEdit<Asset>(
    CollectionNames.Assets,
    assetId
  )

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveSuccess) {
    return <SuccessMessage>License saved</SuccessMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save license</ErrorMessage>
  }

  const updateTag = (tagName: string, newValue: boolean) =>
    setNewTags((currentTags) =>
      newValue
        ? currentTags.concat([tagName])
        : currentTags.filter((tag) => tag !== tagName)
    )

  const onSaveClick = async () => {
    try {
      if (overrideSave) {
        overrideSave(newTags)

        if (onDone) {
          onDone()
        }
        return
      }

      await save({
        tags: newTags,
      })

      onDone()
    } catch (err) {
      console.error('Failed to save license in tags', err)
      handleError(err)
    }
  }

  return (
    <>
      <CheckboxInput
        onChange={(newVal: boolean) =>
          updateTag(publicAvatarsBannedTag, newVal)
        }
        value={newTags.includes(publicAvatarsBannedTag)}
        label="Public avatars banned"
      />
      <p>
        Please include any additional license terms in the description (if
        applicable).
      </p>
      <FormControls>
        <Button onClick={onSaveClick}>Save</Button>
      </FormControls>
    </>
  )
}
