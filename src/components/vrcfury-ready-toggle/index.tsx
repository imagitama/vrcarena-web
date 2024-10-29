import React, { useState } from 'react'
import { Asset, CollectionNames } from '../../modules/assets'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { tagVrcFuryReady } from '../../vrcfury'
import { handleError } from '../../error-handling'
import { removeDuplicates } from '../../utils'
import InlineSaveStatus from '../inline-save-status'
import CheckboxInput from '../checkbox-input'

const VrcFuryToggle = ({
  assetId,
  existingTags,
  overrideSave = undefined,
  onDone = undefined,
}: {
  assetId: string
  existingTags: string[]
  overrideSave?: (tags: string[]) => void
  onDone?: () => void
}) => {
  const [isNowVrcFuryReady, setIsNowVrcFuryReady] = useState<boolean | null>(
    existingTags.includes(tagVrcFuryReady)
  )
  const [isSaving, isSavingSuccess, lastErrorCode, save, clear] =
    useDatabaseSave<Asset>(CollectionNames.Assets, assetId)

  const onChange = async () => {
    try {
      const vrcFuryReadyResult = !isNowVrcFuryReady

      const newTags = vrcFuryReadyResult
        ? removeDuplicates(existingTags.concat(tagVrcFuryReady))
        : existingTags.filter((tag) => tag !== tagVrcFuryReady)

      if (overrideSave) {
        overrideSave(newTags)

        if (onDone) {
          onDone()
        }
        return
      }

      setIsNowVrcFuryReady(vrcFuryReadyResult)

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
      <CheckboxInput
        value={isNowVrcFuryReady === true}
        onChange={onChange}
        isDisabled={isSaving}
        label="VRCFury Ready"
      />{' '}
      <InlineSaveStatus
        isSaving={isSaving}
        isSavingSuccess={isSavingSuccess}
        lastErrorCode={lastErrorCode}
        clear={clear}
      />
      <br />
      <em>Adds "vrcfury_ready" tag to avatar</em>
    </>
  )
}

export default VrcFuryToggle
