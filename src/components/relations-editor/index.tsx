import React, { useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'
import CheckIcon from '@mui/icons-material/Check'

import { handleError } from '../../error-handling'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import {
  Asset,
  CollectionNames,
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
import { RelationItem } from '../relations'
import useTimer from '../../hooks/useTimer'
import { formHideDelay } from '../../config'
import RadioInputs from '../radio-inputs'
import Message from '../message'
import Paper from '../paper'
import Heading from '../heading'
import CheckboxInput from '../checkbox-input'
import WarningMessage from '../warning-message'

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
      requiresVerification: false,
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

  return (
    <Paper className={classes.editor}>
      <Heading variant="h3" noTopMargin>
        Asset
      </Heading>
      {newRelation.asset ? (
        <>
          <AssetResultsItem
            asset={assetsData.find(
              (assetData) => assetData.id === newRelation.asset
            )}
          />
          <Button onClick={() => setField('asset', null)} color="secondary">
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
      <Heading variant="h3">Relation</Heading>
      <RadioInputs
        value={newRelation.type}
        onChange={(newValue) => setField('type', newValue as RelationType)}
        options={Object.entries(RelationType).map(([key, value]) => ({
          value: value,
          label: key,
        }))}
      />
      <CheckboxInput
        label="Verification of the parent asset is required (explain in comments)"
        value={newRelation.requiresVerification || false}
        onChange={(e) =>
          setField(
            'requiresVerification',
            newRelation.requiresVerification == true ? false : true
          )
        }
      />
      <WarningMessage>
        Please explain here if customers need to be "verified" to get this asset
        (such as a Discord bot)
      </WarningMessage>
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
    </Paper>
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
  const [isLoadingAsset, lastErrorCodeLoadingAsset, asset] =
    useDataStoreItem<Asset>(CollectionNames.Assets, item.asset || false)
  const classes = useStyles()

  if (isLoadingAsset) {
    return <LoadingIndicator message="Loading asset..." />
  }

  if (lastErrorCodeLoadingAsset !== null) {
    return (
      <ErrorMessage>
        Failed to load asset (code {lastErrorCodeLoadingAsset})
      </ErrorMessage>
    )
  }

  if (!asset) {
    return <ErrorMessage>Failed to load asset (none found)</ErrorMessage>
  }

  return <RelationItem asset={asset} relation={item} />
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
  onChange = undefined,
  onDone = undefined,
  onCancel = undefined,
  overrideSave = undefined,
}: {
  assetId: string | null
  currentRelations?: Relation[]
  assetsData?: Asset[]
  onChange?: (newRelations: Relation[]) => void
  onDone?: () => void
  onCancel?: () => void
  overrideSave?: (newRelations: Relation[]) => void
}) => {
  const [isSaving, isSuccess, lastErrorCode, save] = useDataStoreEdit<Asset>(
    CollectionNames.Assets,
    assetId || false
  )
  const [isAddFormVisible, setIsAddFormVisible] = useState(false)
  const [newRelations, setNewRelations] = useState<Relation[]>(
    currentRelations || []
  )
  const startSaveDoneTimer = useTimer(
    () => (onDone ? onDone() : {}),
    formHideDelay
  )

  // for asset editor mini
  useEffect(() => {
    if (!onChange || !currentRelations) {
      return
    }
    setNewRelations(currentRelations)
  }, [JSON.stringify(currentRelations)])

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
        relations: newRelations,
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

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to save relations (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  return (
    <div>
      <Message hideId="relations-editor-info">
        We encourage everyone to "link" different assets together to help
        people:
        <ul>
          <li>find a dependency to make your asset work</li>
          <li>find other similar assets</li>
        </ul>
        Please link other assets using this form.
      </Message>
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
      {onChange ? null : (
        <FormControls>
          <Button onClick={onSaveClick} icon={<SaveIcon />}>
            Save
          </Button>{' '}
          {onCancel ? (
            <Button onClick={onCancel} color="secondary">
              Cancel
            </Button>
          ) : null}
        </FormControls>
      )}
    </div>
  )
}

export default RelationsEditor
