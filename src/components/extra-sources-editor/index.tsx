import React, { useEffect, useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'

import Button from '../button'
import TextInput from '../text-input'
import { AssetFields, CollectionNames, SourceInfo } from '../../modules/assets'
import FormControls from '../form-controls'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import { trackAction } from '../../analytics'
import { handleError } from '../../error-handling'
import ItemsEditor from '../items-editor'
import VisitSourceButton from '../visit-source-button'
import PriceAndCurrencyInput from '../price-and-currency-input'
import UrlInput from '../url-input'

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
      <UrlInput
        value={newSourceInfo.url}
        onChange={(newUrl) =>
          setNewSourceInfo((currentVal) => ({
            ...currentVal,
            url: newUrl,
          }))
        }
      />
      <PriceAndCurrencyInput
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
        showPreview={false}
      />
      <TextInput
        label="Comments (optional)"
        multiline
        minRows={2}
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
  onChange,
  overrideSave = undefined,
  actionCategory = undefined,
}: {
  assetId: string | null
  extraSources: SourceInfo[]
  onChange?: (newExtraSources: SourceInfo[]) => void
  onDone?: () => void
  overrideSave?: (newExtraSources: SourceInfo[]) => void
  actionCategory?: string
}) => {
  const [newExtraSources, setNewExtraSources] = useState<SourceInfo[]>(
    extraSources || []
  )
  const [isSaving, isSaveSuccess, lastErrorCode, save] =
    useDataStoreEdit<AssetFields>(CollectionNames.Assets, assetId || false)

  // for asset editor mini
  useEffect(() => {
    if (!onChange || !extraSources) {
      return
    }
    setNewExtraSources(extraSources)
  }, [JSON.stringify(extraSources)])

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
    return <LoadingIndicator message="Saving..." />
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Extra sources saved successfully</SuccessMessage>
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to save asset (code {lastErrorCode})</ErrorMessage>
    )
  }

  return (
    <>
      <ItemsEditor<SourceInfo>
        items={newExtraSources || []}
        renderer={Renderer}
        editor={Editor}
        onChange={(newItems) => {
          if (onChange) {
            onChange(newItems)
          } else {
            setNewExtraSources(newItems)
          }
        }}
        emptyItem={{
          url: '',
          price: null,
          pricecurrency: null,
          comments: '',
        }}
        nameSingular="extra source"
      />
      {!onChange && (
        <FormControls>
          <Button onClick={onClickSave} size="large" icon={<SaveIcon />}>
            Save
          </Button>
        </FormControls>
      )}
    </>
  )
}

export default ExtraSourcesEditor
