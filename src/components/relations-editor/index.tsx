import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import EditIcon from '@material-ui/icons/Edit'
import CheckIcon from '@material-ui/icons/Check'

import { handleError } from '../../error-handling'
import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import {
  Asset,
  FullAsset,
  PublicAsset,
  Relation,
  RelationType,
} from '../../modules/assets'
import AssetSearch from '../asset-search'
import Button from '../button'
import FormControls from '../form-controls'
import ItemsEditor, { Item } from '../items-editor'
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
import RadioInputs from '../radio-inputs'
import HidableMessage from '../hidable-message'

const useStyles = makeStyles({
  editor: {
    marginBottom: '1rem',
  },
  label: {
    fontSize: '150%',
    marginBottom: '0.5rem',
  },
  formLabel: {
    margin: '0.5rem 0',
  },
})

const RelationEditorForm = ({
  relation,
  onDone,
  assetsData: existingAssetsData,
}: {
  onDone: (newRelation: Relation) => void
  relation?: Relation
  assetsData?: Asset[]
}) => {
  const classes = useStyles()
  const [newRelation, setNewRelation] = useState<Relation>(
    relation || {
      asset: '',
      type: RelationType.Parent,
      comments: '',
    }
  )
  const [assetsData, setAssetsData] = useState<(Asset | PublicAsset)[]>(
    existingAssetsData || []
  )

  const onSelectedAsset = (newAsset: Asset | PublicAsset) => {
    console.debug(`Selected asset ${newAsset.id} for relation`)
    setNewRelation({
      ...newRelation,
      asset: newAsset.id,
    })
    setAssetsData((currentData) => currentData.concat([newAsset]))
  }

  const setField = (name: keyof Relation, value: any) =>
    setNewRelation({ ...newRelation, [name]: value })

  const onDoneClick = () => {
    if (!validateRelations([newRelation])) {
      console.warn('Cannot add relation - not valid')
      return
    }
    onDone(newRelation)
  }

  console.debug(`RelationsEditor.render`, { newRelation })

  return (
    <div className={classes.editor}>
      {newRelation.asset ? (
        <>
          <AssetResultsItem
            asset={assetsData.find(
              (assetData) => assetData.id === newRelation.asset
            )}
          />
          <Button onClick={() => setField('asset', null)} color="default">
            Clear
          </Button>
        </>
      ) : (
        <AssetSearch
          selectedAsset={assetsData.find(
            (assetData) => assetData.id === newRelation.asset
          )}
          onSelect={onSelectedAsset}
          limit={10}
        />
      )}
      <RadioInputs
        value={newRelation.type}
        onChange={(newValue) => setField('type', newValue as RelationType)}
        options={Object.entries(RelationType).map(([key, value]) => ({
          value: value,
          label: key,
        }))}
      />
      <TextInput
        multiline
        minRows={2}
        fullWidth
        value={newRelation.comments}
        onChange={(e) => setField('comments', e.target.value)}
        placeholder="Comments (optional)"
      />
      <FormControls>
        <Button onClick={onDoneClick} icon={<CheckIcon />}>
          Done
        </Button>
      </FormControls>
    </div>
  )
}

const Editor = ({
  item,
  onDone,
  assetsData,
}: {
  item: Item<Relation>
  onDone: (newItem: Item<Relation>) => void
  assetsData?: Asset[]
}) => (
  <RelationEditorForm
    relation={item as unknown as Relation}
    onDone={(newRelation: Relation) => onDone(newRelation as Item<Relation>)}
    assetsData={assetsData}
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

const RelationsEditor = ({
  assetId,
  currentRelations = [],
  assetsData = undefined,
  onDone = undefined,
  onCancel = undefined,
  overrideSave = undefined,
}: {
  assetId?: string
  currentRelations?: Relation[]
  assetsData?: Asset[]
  onDone?: () => void
  onCancel?: () => void
  overrideSave?: (newRelations: Relation[]) => void
}) => {
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const [isAddFormVisible, setIsAddFormVisible] = useState(false)
  const [newRelations, setNewRelations] = useState<Relation[]>(
    currentRelations || []
  )
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
        [AssetFieldNames.relations]: newRelations,
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
    return <SuccessMessage>Relations saved</SuccessMessage>
  }

  if (isFailed) {
    return <ErrorMessage>Failed to save relations</ErrorMessage>
  }

  return (
    <div>
      <HidableMessage noticeId="relations-editor-info">
        We encourage everyone to "link" different assets together to help
        people:
        <ul>
          <li>find a dependency to make your asset work</li>
          <li>find other similar assets</li>
        </ul>
        Please link other assets using this form.
      </HidableMessage>
      {isAddFormVisible ? <RelationEditorForm onDone={onAddRelation} /> : null}
      <ItemsEditor<Relation, { assetsData: Asset[] | undefined }>
        nameSingular="relation"
        editor={Editor}
        renderer={Renderer}
        items={newRelations}
        onChange={onNewRelations}
        emptyItem={{
          asset: '',
          type: '',
          comments: '',
        }}
        onAdd={onAddClick}
        getKey={(item) => item.asset}
        commonProps={{
          assetsData,
        }}
      />
      <FormControls>
        <Button onClick={onSaveClick} icon={<SaveIcon />}>
          Save
        </Button>{' '}
        {onCancel ? (
          <Button onClick={onCancel} color="default">
            Cancel
          </Button>
        ) : null}
      </FormControls>
    </div>
  )
}

export default RelationsEditor
