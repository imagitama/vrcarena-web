import React, { useEffect, useState } from 'react'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'

import { VrchatWorld } from '../../modules/vrchat-cache'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '../../config'
import { trackAction } from '../../analytics'
import { handleError } from '../../error-handling'

import VrchatWorlds from '../vrchat-worlds'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import GetVrchatWorldDetails from '../get-vrchat-world-details'
import ImageUploader from '../image-uploader'
import FormControls from '../form-controls'
import Button from '../button'
import Heading from '../heading'
import { getImageUrlAsFile } from '../../utils/files'
import { inDevelopment } from '../../environment'

import defaultThumbnailUrl from '../../assets/images/default-thumbnail.webp'
import AssetThumbnail from '../asset-thumbnail'
import { bucketNames } from '../../file-uploading'

const analyticsCategoryName = 'ViewAssetEditor'

const UseForAssetForm = ({
  worldId,
  worldData,
  save
}: {
  worldId: string
  worldData?: VrchatWorld
  save: (newFields: { [key: string]: any }) => void
}) => {
  const [newFields, setNewFields] = useState<{ [key: string]: any }>({})
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [previewImageFile, setPreviewImageFile] = useState<File>()

  const setField = (fieldName: string, value: any) =>
    setNewFields(currentVal => ({
      ...currentVal,
      [fieldName]: value
    }))

  const onSave = () => save(newFields)

  useEffect(() => {
    if (!worldId || !worldData) {
      return
    }

    ;(async () => {
      try {
        const vrchatThumbnailUrl = inDevelopment()
          ? defaultThumbnailUrl
          : worldData.imageUrl

        console.debug(`Using thumbnail URL ${vrchatThumbnailUrl}...`)

        const file = await getImageUrlAsFile(
          vrchatThumbnailUrl,
          `vrchat-world-${worldId}`
        )
        setPreviewImageFile(file)
        setPreviewImageUrl(vrchatThumbnailUrl)

        setNewFields({
          [AssetFieldNames.title]: worldData.name,
          [AssetFieldNames.description]: worldData.description
        })
      } catch (err) {
        console.error(err)
        handleError(err)
      }
    })()
  }, [worldId, worldData])

  if (!previewImageUrl || !previewImageFile) {
    return <LoadingIndicator message="Waiting for image..." />
  }

  return (
    <>
      <Heading variant="h2">Sync With VRChat World</Heading>
      <p>Title: {newFields[AssetFieldNames.title] || '(none)'}</p>
      <p>Description: {newFields[AssetFieldNames.description] || '(none)'}</p>

      <Heading variant="h3">Thumbnail</Heading>
      {newFields[AssetFieldNames.thumbnailUrl] ? (
        <>
          <AssetThumbnail url={newFields[AssetFieldNames.thumbnailUrl]} />
          <Button onClick={() => setField(AssetFieldNames.thumbnailUrl, '')}>
            Try Again
          </Button>
        </>
      ) : (
        <ImageUploader
          preloadImageUrl={previewImageUrl}
          preloadFile={previewImageFile}
          requiredWidth={THUMBNAIL_WIDTH}
          requiredHeight={THUMBNAIL_HEIGHT}
          onDone={urls => {
            console.debug(`New thumbnail has been uploaded: ${urls[0]}`)
            setField(AssetFieldNames.thumbnailUrl, urls[0])
          }}
          bucketName={bucketNames.assetThumbnails}
        />
      )}
      <FormControls>
        <Button onClick={onSave}>Save</Button>
      </FormControls>
    </>
  )
}

export default ({
  assetId,
  worldIds = [],
  onDone,
  overrideSave = undefined
}: {
  assetId: string
  worldIds?: string[]
  onDone?: () => void
  overrideSave?: (newWorldIds?: string[]) => void
}) => {
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const [worldIdToUseForAsset, setWorldIdToUseForAsset] = useState('')
  const [worldDataToUseForAsset, setWorldDataToUseForAsset] = useState<
    VrchatWorld
  >()

  const saveAssetWithNewFields = async (newFields: { [key: string]: any }) => {
    try {
      if (overrideSave) {
        overrideSave()

        if (onDone) {
          onDone()
        }
        return
      }

      trackAction(analyticsCategoryName, 'Click save asset button', assetId)

      await save(newFields)

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onAddWorldById = async (id: string) => {
    const newWorldIds = worldIds.concat([id])

    try {
      if (overrideSave) {
        overrideSave(newWorldIds)

        if (onDone) {
          onDone()
        }
        return
      }

      trackAction(analyticsCategoryName, 'Click add world by ID', {
        assetId,
        worldId: id
      })

      await save({
        [AssetFieldNames.vrchatClonableWorldIds]: newWorldIds
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onRemoveWorldById = async (id: string) => {
    const newWorldIds = worldIds.filter(itemId => itemId !== id)

    try {
      if (overrideSave) {
        overrideSave(newWorldIds)

        if (onDone) {
          onDone()
        }
        return
      }

      trackAction(analyticsCategoryName, 'Click remove world by ID', {
        assetId,
        worldId: id
      })

      await save({
        [AssetFieldNames.vrchatClonableWorldIds]: newWorldIds
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onUseForAssetByIdAndData = (
    id: string,
    worldData: VrchatWorld | null
  ) => {
    if (!worldData) {
      console.error('No world data provided')
      return
    }
    setWorldIdToUseForAsset(id)
    setWorldDataToUseForAsset(worldData)
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isSuccess) {
    return <SuccessMessage>Asset saved successfully</SuccessMessage>
  }

  if (isFailed) {
    return <ErrorMessage>Error saving asset</ErrorMessage>
  }

  return (
    <>
      <VrchatWorlds
        worldIds={worldIds}
        showControls
        onRemove={onRemoveWorldById}
        onUseForAsset={onUseForAssetByIdAndData}
      />
      {worldIdToUseForAsset ? (
        <UseForAssetForm
          worldId={worldIdToUseForAsset}
          worldData={worldDataToUseForAsset}
          save={saveAssetWithNewFields}
        />
      ) : (
        <GetVrchatWorldDetails
          onDone={(
            worldId: string,
            worldData: VrchatWorld,
            reset: () => void
          ) => {
            onAddWorldById(worldId)
            reset()
          }}
        />
      )}
    </>
  )
}
