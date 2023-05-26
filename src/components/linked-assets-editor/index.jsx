import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'

import Button from '../button'
import FormControls from '../form-controls'
import SearchForAssetForm from '../search-for-asset-form'
import AssetResultsItem from '../asset-results-item'

import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

const useStyles = makeStyles({
  textInput: {
    width: '100%'
  },
  row: {
    marginTop: '1rem'
  },
  assets: {
    display: 'flex'
  },
  asset: {
    height: '100%',
    marginRight: '0.5rem'
  },
  btn: {
    marginTop: '0.25rem'
  }
})

function LinkedAsset({ asset, onRemove }) {
  const classes = useStyles()
  return (
    <div className={classes.asset}>
      <AssetResultsItem asset={asset} onClick={e => e.preventDefault()} />
      <Button onClick={onRemove} color="default" className={classes.button}>
        Remove
      </Button>
    </div>
  )
}

export default ({
  assetId,
  linkedAssetIds = [],
  linkedAssetData = [],
  actionCategory,
  onDone = null,
  onCancel,
  overrideSave = null
}) => {
  const userId = useUserId()
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  // assets can be "null" if they linked a deleted asset etc.
  const [newLinkedAssetIds, setNewLinkedAssetIds] = useState(
    linkedAssetIds ? linkedAssetIds.filter(item => item) : []
  )
  const [newLinkedAssetData, setNewLinkedAssetData] = useState(
    linkedAssetData ? linkedAssetData.filter(item => item) : []
  )
  const classes = useStyles()

  if (!userId) {
    return 'You are not logged in'
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isSuccess) {
    return 'Asset saved successfully'
  }

  if (isFailed) {
    return 'Error saving author'
  }

  const onSaveBtnClick = async () => {
    try {
      if (overrideSave) {
        overrideSave(newLinkedAssetIds)

        if (onDone) {
          onDone()
        }
        return
      }

      trackAction(actionCategory, 'Click save linked assets button', assetId)

      await save({
        [AssetFieldNames.children]: newLinkedAssetIds
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onSelectIdWithDetails = (id, details) => {
    setNewLinkedAssetIds(currentVal => currentVal.concat([id]))
    setNewLinkedAssetData(currentVal => currentVal.concat([details]))
  }

  const removeAssetById = id => {
    setNewLinkedAssetIds(currentVal =>
      currentVal.filter(assetId => assetId !== id)
    )
    setNewLinkedAssetData(currentVal =>
      currentVal.filter(assetData => assetData.id !== id)
    )
  }

  return (
    <>
      You have selected these assets:
      <br />
      <br />
      {newLinkedAssetData.length ? (
        <div className={classes.assets}>
          {newLinkedAssetData.map(linkedAsset => (
            <LinkedAsset
              key={linkedAsset.id}
              asset={linkedAsset}
              onRemove={() => removeAssetById(linkedAsset.id)}
            />
          ))}
        </div>
      ) : (
        'No linked assets yet'
      )}
      <>
        <div className={classes.row}>
          <SearchForAssetForm onSelectIdWithDetails={onSelectIdWithDetails} />
        </div>

        <div className={classes.row}>
          <FormControls>
            <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
              Save
            </Button>{' '}
            <Button onClick={() => onCancel()} color="default">
              Cancel
            </Button>
          </FormControls>
        </div>
      </>
    </>
  )
}
