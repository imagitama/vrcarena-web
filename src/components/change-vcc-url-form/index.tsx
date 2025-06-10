import React, { useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { Asset, CollectionNames } from '../../modules/assets'

import TextInput from '../text-input'
import Button from '../button'
import FormControls from '../form-controls'
import AddToVccButton from '../add-to-vcc-button'

const ChangeVccUrlForm = ({
  assetId,
  existingVccUrl = undefined,
  actionCategory = undefined,
  onDone = undefined,
  onCancel = undefined,
  overrideSave = undefined,
}: {
  assetId?: string
  existingVccUrl?: string
  actionCategory?: string
  onDone?: () => void
  onCancel?: () => void
  overrideSave?: (newVccUrl: string) => void
}) => {
  const userId = useUserId()
  const [isSaving, isSuccess, lastErrorCode, save] = useDatabaseSave<Asset>(
    CollectionNames.Assets,
    assetId
  )
  const [newVccUrl, setNewVccUrl] = useState<string>(existingVccUrl || '')

  if (!userId) {
    return <>You are not logged in</>
  }

  if (isSaving) {
    return <>Saving...</>
  }

  if (isSuccess) {
    return <>VCC URL has been changed</>
  }

  if (lastErrorCode !== null) {
    return <>Error saving asset (code {lastErrorCode})</>
  }

  const onSaveBtnClick = async () => {
    try {
      if (overrideSave) {
        overrideSave(newVccUrl)

        if (onDone) {
          onDone()
        }
        return
      }

      if (actionCategory) {
        trackAction(actionCategory, 'Click save vcc url button', assetId)
      }

      await save({
        vccurl: newVccUrl,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      Set to either a JSON file or a Git repo URL:
      <ul>
        <li>https://vrchat-community.github.io/template-package/index.json</li>
        <li>https://github.com/vrchat-community/template-package.git</li>
      </ul>
      If the URL has no extension it is considered a Git repo.
      <br />
      <br />
      <TextInput
        value={newVccUrl}
        onChange={(e) => setNewVccUrl(e.target.value)}
        fullWidth
      />
      {newVccUrl ? (
        <>
          <br />
          <br />
          Preview:&nbsp;&nbsp;&nbsp;
          <AddToVccButton vccUrl={newVccUrl} />
        </>
      ) : null}
      <FormControls>
        <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
          Save
        </Button>{' '}
        {onCancel && (
          <Button onClick={() => onCancel()} color="secondary">
            Cancel
          </Button>
        )}
      </FormControls>
    </>
  )
}

export default ChangeVccUrlForm
