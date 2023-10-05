import React, { useState } from 'react'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'

import { handleError } from '../../error-handling'
import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { Asset, Relation, RelationType } from '../../modules/assets'
import AssetSearch from '../asset-search'
import Button from '../button'
import FormControls from '../form-controls'
import ItemsEditor, { Item } from '../items-editor'
import Select from '../select'
import TextInput from '../text-input'
import AssetResultsItem from '../asset-results-item'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import SuccessMessage from '../success-message'
import Markdown from '../markdown'
import { getLabelForType } from '../relations'
import useTimer from '../../hooks/useTimer'
import { formHideDelay } from '../../config'

const useStyles = makeStyles({
  editor: {
    marginBottom: '1rem'
  },
  label: {
    fontSize: '150%',
    marginBottom: '0.5rem'
  }
})

const RelationEditorForm = ({
  relation,
  onDone
}: {
  onDone: (newRelation: Relation) => void
  relation?: Relation
}) => {
  const classes = useStyles()
  const [newRelation, setNewRelation] = useState<Relation>(
    relation || {
      asset: '',
      type: '',
      comments: ''
    }
  )
  const [assetsData, setAssetsData] = useState<Asset[]>([])

  const onSelectedAsset = (newAsset: Asset) => {
    console.debug(`Selected asset ${newAsset.id} for relation`)
    setNewRelation({
      ...newRelation,
      asset: newAsset.id
    })
    setAssetsData(currentData => currentData.concat([newAsset]))
  }

  const onCommentsChange = (newComments: string) =>
    setNewRelation({ ...newRelation, comments: newComments })

  const onDoneClick = () => {
    if (!validateRelations([newRelation])) {
      console.warn('Cannot add relation - not valid')
      return
    }
    onDone(newRelation)
  }

  return (
    <div className={classes.editor}>
      <AssetSearch
        selectedAsset={assetsData.find(
          assetData => assetData.id === newRelation.asset
        )}
        onSelect={onSelectedAsset}
        limit={10}
      />
      <Select
        fullWidth
        onChange={e =>
          setNewRelation(currentVal => ({
            ...currentVal,
            type: e.target.value as string
          }))
        }
        value={newRelation.type}>
        <MenuItem value="" disabled>
          Select a relationship
        </MenuItem>
        {Object.entries(RelationType).map(([label, value]) => (
          <MenuItem
            key={value}
            value={value}
            selected={newRelation.type === value}>
            {label}
          </MenuItem>
        ))}
      </Select>
      <TextInput
        multiline
        rows={2}
        fullWidth
        value={newRelation.comments}
        onChange={e => onCommentsChange(e.target.value)}
        placeholder="Comments (optional)"
      />
      <FormControls>
        <Button onClick={onDoneClick}>
          {relation ? 'Edit' : 'Add'} Relation
        </Button>
      </FormControls>
    </div>
  )
}

const Editor = ({
  item,
  onDone
}: {
  item: Item<Relation>
  onDone: (newItem: Item<Relation>) => void
}) => (
  <RelationEditorForm
    relation={(item as unknown) as Relation}
    onDone={(newRelation: Relation) => onDone(newRelation as Item<Relation>)}
  />
)

const Renderer = ({ item }: { item: Item<Relation> }) => {
  const [isLoadingAsset, isErrorLoadingAsset, asset] = useDataStoreItem<Asset>(
    CollectionNames.Assets,
    item.asset || false
  )
  const classes = useStyles()

  if (isLoadingAsset) {
    return <LoadingIndicator message="Loading asset..." />
  }

  if (isErrorLoadingAsset || !asset) {
    return <ErrorMessage>Failed to load asset</ErrorMessage>
  }

  return (
    <div>
      <div className={classes.label}>{getLabelForType(item.type)}</div>
      <AssetResultsItem asset={asset} />
      <Markdown source={item.comments} />
    </div>
  )
}

const validateRelations = (relations: Relation[]): boolean => {
  for (const relation of relations) {
    if (!relation.asset) {
      console.warn('Relation asset not set')
      return false
    }
    if (!relation.type) {
      console.warn('Relation type not set')
      return false
    }
  }

  return true
}

export default ({
  assetId,
  currentRelations = [],
  onDone = undefined,
  onCancel = undefined,
  overrideSave = undefined
}: {
  assetId?: string
  currentRelations?: Relation[]
  onDone?: () => void
  onCancel?: () => void
  overrideSave?: (newRelations: Relation[]) => void
}) => {
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const [isAddFormVisible, setIsAddFormVisible] = useState(false)
  const [newRelations, setNewRelations] = useState<Relation[]>(currentRelations)
  const startSaveDoneTimer = useTimer(
    () => (onDone ? onDone() : {}),
    formHideDelay
  )

  const onNewRelations = (relations: Relation[]) => setNewRelations(relations)
  const onAddRelation = (newRelation: Relation) => {
    setNewRelations(newRelations.concat(newRelation))
    setIsAddFormVisible(false)
  }

  const onSaveClick = async () => {
    try {
      if (!validateRelations(newRelations)) {
        console.warn('Relations are not valid', newRelations)
        return
      }

      if (overrideSave) {
        overrideSave(newRelations)

        if (onDone) {
          onDone()
        }

        return
      }

      if (!assetId) {
        console.warn('Cannot save without an asset ID')
        return
      }

      await save({
        [AssetFieldNames.relations]: newRelations
      })

      startSaveDoneTimer()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onAddClick = () => setIsAddFormVisible(true)

  if (isSaving) {
    return <LoadingIndicator message="Saving relations..." />
  }

  if (isSuccess) {
    return <SuccessMessage>Relations saved!</SuccessMessage>
  }

  if (isFailed) {
    return <ErrorMessage>Failed to save relations</ErrorMessage>
  }

  return (
    <div>
      {isAddFormVisible ? <RelationEditorForm onDone={onAddRelation} /> : null}
      <ItemsEditor
        // @ts-ignore
        editor={<Editor />}
        // @ts-ignore
        renderer={<Renderer />}
        items={newRelations}
        onChange={onNewRelations}
        emptyItem={{
          asset: '',
          type: '',
          comments: ''
        }}
        onAdd={onAddClick}
      />
      <FormControls>
        <Button onClick={onSaveClick}>Save</Button>{' '}
        {onCancel ? (
          <Button onClick={onCancel} color="default">
            Cancel
          </Button>
        ) : null}
      </FormControls>
    </div>
  )
}
