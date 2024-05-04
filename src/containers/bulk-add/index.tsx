import React, { useEffect, useState } from 'react'

import Button from '../../components/button'
import FormControls from '../../components/form-controls'
import Heading from '../../components/heading'
import NoPermissionMessage from '../../components/no-permission-message'
import TextInput from '../../components/text-input'
import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import useIsEditor from '../../hooks/useIsEditor'
import { getIsVrchatWorldId } from '../../utils'
import {
  AssetCategories,
  AssetFieldNames,
  CollectionNames,
  AssetMetaFieldNames,
  AccessStatuses,
  PublishStatuses,
  ApprovalStatuses,
} from '../../hooks/useDatabaseQuery'
import { VrchatWorld } from '../../modules/vrchat-cache'
import { insertRecord, updateRecords } from '../../data-store'
import { Asset } from '../../modules/assets'
import Link from '../../components/link'
import * as routes from '../../routes'
import AssetResults from '../../components/asset-results'
import Message from '../../components/message'
import WarningMessage from '../../components/warning-message'
import CheckboxInput from '../../components/checkbox-input'
import AssetEditorMini from '../../components/asset-editor-mini'

const fetchWorldDataAndThumbnailById = async (
  id: string
): Promise<{ world: VrchatWorld; thumbnailUrl: string }> => {
  // NOTE: This function also dumps it into a cache for later retrieval
  const {
    data: { world, thumbnailUrl },
  } = await callFunction('getVrchatWorldDetails', {
    worldId: id,
    convertThumbnail: true, // note: 300x300
  })

  return {
    world,
    thumbnailUrl,
  }
}

interface VrchatWorldWithOurThumbnail extends VrchatWorld {
  ourThumbnailUrl: string
}

const VrchatWorldOutput = ({
  worldIds,
  onDoneWithWorldDatas,
  onCancel,
}: {
  worldIds: string[]
  onDoneWithWorldDatas: (worldDataById: {
    [worldId: string]: VrchatWorldWithOurThumbnail
  }) => void
  onCancel: () => void
}) => {
  const [progressByWorldId, setProgressByWorldId] = useState<{
    [key: string]: boolean
  }>({})

  useEffect(() => {
    if (!worldIds.length) {
      return
    }

    ;(async () => {
      try {
        console.debug(`Fetching ${worldIds.length} worlds...`)

        const worldDataById: {
          [worldId: string]: VrchatWorldWithOurThumbnail
        } = {}

        // do this 1 by 1 to avoid DDOSing the VRChat API
        for (const worldId of worldIds) {
          setProgressByWorldId((currentVal) => ({
            ...currentVal,
            [worldId]: false,
          }))

          const { world: worldData, thumbnailUrl } =
            await fetchWorldDataAndThumbnailById(worldId)

          worldDataById[worldId] = {
            ...worldData,
            ourThumbnailUrl: thumbnailUrl,
          }

          setProgressByWorldId((currentVal) => ({
            ...currentVal,
            [worldId]: true,
          }))
        }

        onDoneWithWorldDatas(worldDataById)
      } catch (err) {
        console.error(err)
        handleError(err)
      }
    })()
  }, [worldIds.join(',')])

  return (
    <div>
      <ul>
        {worldIds.map((id) => (
          <li key={id}>
            {id} -{' '}
            {progressByWorldId[id] === true
              ? 'Done'
              : progressByWorldId[id] === false
              ? 'Fetching...'
              : 'Waiting'}
          </li>
        ))}
      </ul>
      <FormControls>
        <Button
          isDisabled={
            worldIds.length > 0 &&
            Object.values(progressByWorldId).filter((status) => status === true)
              .length === worldIds.length
          }>
          Proceed
        </Button>{' '}
        <Button onClick={onCancel} color="default">
          Cancel
        </Button>
      </FormControls>
    </div>
  )
}

const foo = {
  sleep_world: ['sleep', 'bed'],
  chill: [
    'chill',
    'mirror',
    'apartment',
    'house',
    'lounge',
    'cabin',
    'room',
    'villa',
    'rain',
  ],
  game: ['game', 'horror'],
  club: ['club', 'party', 'dance'],
  movie_world: ['movie'],
  music: ['album', 'song', 'listen'],
  wip: ['work in progress', 'wip'],
}

const detectTagsFromVrchatWorld = (worldData: VrchatWorld): string[] => {
  const tags: string[] = []
  const nameLower = worldData.name.toLowerCase()
  const descriptionLower = worldData.description.toLowerCase()

  for (const [tagToUse, possibleTags] of Object.entries(foo)) {
    for (const possibleTag of possibleTags) {
      if (
        nameLower.includes(possibleTag) ||
        descriptionLower.includes(possibleTag)
      ) {
        if (!tags.includes(tagToUse)) {
          tags.push(tagToUse)
        }
      }
    }
  }

  return tags
}

const formatDesc = (desc: string): string => `> ${desc}`

const Form = ({
  worldData,
  newFields,
  onNewFields,
}: {
  worldData: VrchatWorldWithOurThumbnail
  newFields: FieldsData
  onNewFields: (newFields: FieldsData) => void
}) => {
  return (
    <AssetEditorMini
      newFields={{
        ...newFields,
        [AssetFieldNames.thumbnailUrl]: worldData.ourThumbnailUrl,
      }}
      onNewFields={onNewFields}
    />
  )
}

type FieldsData = any

const getInitialFields = (worldDataById: {
  [worldId: string]: VrchatWorldWithOurThumbnail
}) => {
  const initialFields: { [worldId: string]: FieldsData } = {}

  for (const worldId in worldDataById) {
    const worldData = worldDataById[worldId]
    initialFields[worldId] = {
      [AssetFieldNames.title]: worldData.name,
      [AssetFieldNames.description]: formatDesc(worldData.description),
      [AssetFieldNames.tags]: detectTagsFromVrchatWorld(worldData),
      [AssetFieldNames.thumbnailUrl]: worldData.ourThumbnailUrl,
    }
  }

  return initialFields
}

const Forms = ({
  worldDataById,
}: {
  worldDataById: { [worldId: string]: VrchatWorldWithOurThumbnail }
}) => {
  const [newFieldsByWorldId, setNewFieldsByWorldId] = useState<{
    [worldId: string]: FieldsData
  }>(getInitialFields(worldDataById))
  const [needsToConfirm, setNeedsToConfirm] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [assetIdsByWorldId, setAssetIdsByWorldId] = useState<{
    [worldId: string]: string | null
  }>({})
  const [automaticallyApprove, setAutomaticallyApprove] = useState(false)

  const onProceed = () => setNeedsToConfirm(true)
  const onCancel = () => setNeedsToConfirm(false)
  const onCreate = async () => {
    try {
      console.debug(`Inserting assets...`)

      setHasStarted(true)

      const assetIds: string[] = []

      for (const [worldId, fields] of Object.entries(newFieldsByWorldId)) {
        setAssetIdsByWorldId((currentVal) => ({
          ...currentVal,
          [worldId]: null,
        }))

        const fieldsToInsert = {
          ...fields,
          [AssetFieldNames.vrchatClonableWorldIds]: [worldId],
        }

        const asset = await insertRecord<any, Asset>(
          CollectionNames.Assets,
          fieldsToInsert,
          false // ensure we do a SELECT to get ID
        )

        setAssetIdsByWorldId((currentVal) => ({
          ...currentVal,
          [worldId]: asset.id,
        }))

        assetIds.push(asset.id)
      }

      if (automaticallyApprove) {
        console.debug(`Automatically approving...`)

        await updateRecords(CollectionNames.AssetMeta, assetIds, {
          [AssetMetaFieldNames.publishStatus]: PublishStatuses.Published,
          [AssetMetaFieldNames.approvalStatus]: ApprovalStatuses.Approved,
        })
      }

      console.debug(`Done`)
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onNewFieldsByWorldId = (worldId: string, newFields: any) =>
    setNewFieldsByWorldId((currentVal) => ({
      ...currentVal,
      [worldId]: newFields,
    }))

  if (hasStarted) {
    return (
      <>
        <ul>
          {Object.entries(assetIdsByWorldId).map(([worldId, assetId]) => (
            <li key={worldId}>
              {worldId} -{' '}
              {assetId === null ? (
                'Inserting...'
              ) : (
                <>
                  Done!{' '}
                  <Link
                    to={routes.viewAssetWithVar.replace(':assetId', assetId)}>
                    Link
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
      </>
    )
  }

  if (needsToConfirm) {
    return (
      <>
        <Message>
          Are you sure you want to create these assets? You cannot reverse this!
          <br />
          <CheckboxInput
            value={automaticallyApprove}
            onChange={(newVal) => setAutomaticallyApprove(newVal)}
            label="Automatically approve them (warning: this triggers automatic Discord/email notifications!)"
          />
        </Message>
        <AssetResults assets={Object.values(newFieldsByWorldId)} />
        <FormControls>
          <Button onClick={onCreate}>Confirm! Create them!</Button>{' '}
          <Button onClick={onCancel} color="default">
            Cancel
          </Button>
        </FormControls>
      </>
    )
  }

  return (
    <>
      {Object.entries(worldDataById).map(([worldId, worldData]) => (
        <div key={worldId} style={{ marginTop: '1rem' }}>
          <Form
            worldData={worldData}
            newFields={newFieldsByWorldId[worldId]}
            onNewFields={(newFields) =>
              onNewFieldsByWorldId(worldId, newFields)
            }
          />
        </div>
      ))}
      <FormControls>
        <Button onClick={onProceed}>Proceed</Button>{' '}
        <Button onClick={onCancel} color="default">
          Cancel
        </Button>
      </FormControls>
    </>
  )
}

const BulkAddVrchatWorlds = () => {
  const [textValue, setTextValue] = useState('')
  const [worldIds, setWorldIds] = useState<string[]>([])
  const [shouldPrepare, setShouldPrepare] = useState(false)
  const [worldDataById, setWorldDataById] = useState<{
    [worldId: string]: VrchatWorldWithOurThumbnail
  } | null>(null)

  const onDetectIds = () => {
    const newWorldIds = textValue
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => getIsVrchatWorldId(line))
    console.debug(`${textValue} => ${newWorldIds.join(',')}`)
    setWorldIds(newWorldIds)
  }

  const onPrepare = () => {
    setShouldPrepare(true)
  }

  const onCancel = () => {
    setTextValue('')
    setShouldPrepare(false)
    setWorldIds([])
  }

  const onDoneFetchingWorlds = (newData: {
    [worldId: string]: VrchatWorldWithOurThumbnail
  }) => {
    setWorldDataById(newData)
  }

  if (worldDataById !== null) {
    return <Forms worldDataById={worldDataById} />
  }

  if (shouldPrepare) {
    return (
      <>
        <VrchatWorldOutput
          worldIds={worldIds}
          onDoneWithWorldDatas={onDoneFetchingWorlds}
          onCancel={onCancel}
        />
      </>
    )
  }

  if (worldIds.length) {
    return (
      <>
        <p>Detected these world IDs from your input:</p>
        <ul>
          {worldIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
        <FormControls>
          <Button onClick={onPrepare} isDisabled={worldIds.length === 0}>
            Continue
          </Button>{' '}
          <Button onClick={onCancel} color="default">
            Cancel
          </Button>
        </FormControls>
      </>
    )
  }

  return (
    <>
      <p>
        Enter a world ID per line (eg.
        wrld_70664568-a6d6-4261-8cfa-f92294d6cd20)
      </p>
      <TextInput
        multiline
        rows={10}
        fullWidth
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
      />
      <FormControls>
        <Button onClick={onDetectIds}>Detect IDs</Button>{' '}
        <Button onClick={onCancel} color="default">
          Cancel
        </Button>
      </FormControls>
    </>
  )
}

export default () => {
  const isEditor = useIsEditor()

  if (!isEditor) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Bulk Add</Heading>
      <p>Add multiple assets to the site.</p>
      <WarningMessage>
        This tool does not verify if the assets already exist. It just creates
        them. YOU are responsible to verify they exist or not.
      </WarningMessage>
      <BulkAddVrchatWorlds />
    </>
  )
}
