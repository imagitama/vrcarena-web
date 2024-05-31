import React, { useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'

import Button from '../button'
import TextInput from '../text-input'
import { AssetFields, CollectionNames, SourceInfo } from '../../modules/assets'
import FormControls from '../form-controls'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import { trackAction } from '../../analytics'
import { handleError } from '../../error-handling'
import PriceInput from '../price-input'
import ItemsEditor from '../items-editor'
import VisitSourceButton from '../visit-source-button'

const Renderer = ({ item }: { item: SourceInfo }) => (
  <>
    {item.url}
    <br />
    <VisitSourceButton sourceInfo={item} />
  </>
)

const Editor = ({
  item,
  onDone,
}: {
  item: SourceInfo
  onDone: (newItem: SourceInfo) => void
}) => {
  const [newSourceInfo, setNewSourceInfo] = useState(item)
  return (
    <>
      <TextInput
        label="URL"
        fullWidth
        value={newSourceInfo.url}
        onChange={(e) => {
          const newUrl = e.target.value.trim()
          setNewSourceInfo({
            ...newSourceInfo,
            url: newUrl,
          })
        }}
        placeholder="Enter a URL"
      />
      <PriceInput
        price={newSourceInfo.price}
        priceCurrency={
          newSourceInfo.pricecurrency === null
            ? 'USD'
            : newSourceInfo.pricecurrency
        }
        onChange={(newPrice, newPriceCurrency) => {
          setNewSourceInfo({
            ...newSourceInfo,
            price: newPrice,
            pricecurrency: newPriceCurrency,
          })
        }}
      />
      <TextInput
        label="Comments (optional)"
        multiline
        rows={2}
        fullWidth
        value={newSourceInfo.comments}
        onChange={(e) => {
          const newComments = e.target.value.trimLeft()
          setNewSourceInfo({
            ...newSourceInfo,
            comments: newComments,
          })
        }}
      />
      <FormControls>
        <Button onClick={() => onDone(newSourceInfo)}>Done</Button>
      </FormControls>
    </>
  )
}

const ExtraSourcesEditor = ({
  assetId,
  extraSources,
  onDone,
  overrideSave = undefined,
  actionCategory = undefined,
}: {
  assetId: string | null
  extraSources: SourceInfo[]
  onDone: () => void
  overrideSave?: (newExtraSources: SourceInfo[]) => void
  actionCategory?: string
}) => {
  const [newExtraSources, setNewExtraSources] = useState<SourceInfo[]>(
    extraSources || []
  )
  const [isSaving, isSaveSuccess, lastError, save] =
    useDatabaseSave<AssetFields>(
      assetId ? CollectionNames.Assets : false,
      assetId
    )

  const onClickSave = async () => {
    try {
      if (overrideSave) {
        overrideSave(newExtraSources)

        if (onDone) {
          onDone()
        }
        return
      }

      if (actionCategory) {
        trackAction(actionCategory, 'Click save button')
      }

      if (!assetId) {
        return
      }

      await save({
        extrasources: newExtraSources,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset', err)
      handleError(err)
    }
  }

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Extra sources saved successfully</SuccessMessage>
  }

  if (lastError) {
    return <ErrorMessage>Failed to save asset</ErrorMessage>
  }

  return (
    <>
      <ItemsEditor<SourceInfo>
        items={newExtraSources || []}
        renderer={Renderer}
        editor={Editor}
        onChange={(newItems) => setNewExtraSources(newItems)}
        emptyItem={{
          url: '',
          price: null,
          pricecurrency: null,
          comments: '',
        }}
      />
      <FormControls>
        <Button onClick={onClickSave} size="large" icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
    </>
  )
}

export default ExtraSourcesEditor
