import React, { useState } from 'react'

import { Asset, CollectionNames } from '@/modules/assets'
import { tagVrcFuryReady } from '@/vrcfury'
import { handleError } from '@/error-handling'
import { removeDuplicates } from '@/utils'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'

import InlineSaveStatus from '@/components/inline-save-status'
import CheckboxInput from '@/components/checkbox-input'

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
    useDataStoreEdit<Asset>(CollectionNames.Assets, assetId)

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
      <em>Adds or removes "vrcfury_ready" tag from the asset</em>
    </>
  )
}

export default VrcFuryToggle
