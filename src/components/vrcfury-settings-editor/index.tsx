import React, { useState } from 'react'
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'

import { CollectionNames } from '../../hooks/useDatabaseQuery'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import FormControls from '../form-controls'
import {
  Asset,
  ExtraData,
  VrcFuryPrefabInfo,
  VrcFurySettings,
} from '../../modules/assets'
import ItemsEditor, { Item } from '../items-editor'
import UrlSelector from '../url-selector'
import CheckboxInput from '../checkbox-input'
import ChangeDiscordServerForm from '../change-discord-server-form'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import DiscordServerResultsItem from '../discord-server-results-item'

const actionCategory = 'AssetOverviewEditor'

const PrefabRenderer = ({ item }: { item: Item<VrcFuryPrefabInfo> }) => {
  return (
    <div>
      {item.url}
      {item.discordServerId ? (
        <>
          <br />
          <br />
          Discord server: {item.discordServerId}
        </>
      ) : null}
    </div>
  )
}

const PrefabEditor = ({
  item,
  onDone,
}: {
  item: Item<VrcFuryPrefabInfo>
  onDone: (newFields: Item<VrcFuryPrefabInfo>) => void
}) => {
  const [url, setUrl] = useState(item.url || '')
  const [discordServerId, setDiscordServerId] = useState<
    string | null | undefined
  >(item.discordServerId || undefined)
  const [doesRequireDiscordServer, setDoesRequireDiscordServer] = useState(
    item.discordServerId ? true : false
  )
  const [isChangeDiscordServerFormVisible] = useState(false)

  const onDoneClick = () => {
    if (url) {
      onDone({
        url,
        discordServerId,
      })
    } else {
      console.warn('No URL set')
    }
  }

  return (
    <div>
      <UrlSelector
        existingUrl={url}
        onChange={(url) => setUrl(url)}
        label="URL to Discord message or website that contains a download link (do not direct link to ZIP/.unitypackage)"
      />
      <CheckboxInput
        value={doesRequireDiscordServer}
        label="People must join a Discord server to download it"
        onChange={() =>
          setDoesRequireDiscordServer((currentVal) => !currentVal)
        }
      />
      {doesRequireDiscordServer &&
        (isChangeDiscordServerFormVisible || !discordServerId ? (
          <ChangeDiscordServerForm
            existingDiscordServerId={discordServerId}
            overrideSave={(newId) => setDiscordServerId(newId)}
          />
        ) : item.discordserverdata && discordServerId ? (
          <DiscordServerResultsItem
            discordServer={{ id: discordServerId, ...item.discordserverdata }}
          />
        ) : (
          <div>
            Using this: {discordServerId}{' '}
            <Button
              onClick={() => {
                setDiscordServerId(undefined)
              }}>
              Clear
            </Button>
          </div>
        ))}
      <FormControls>
        <Button onClick={onDoneClick} icon={<CheckIcon />}>
          Finish Editing Relation
        </Button>
      </FormControls>
    </div>
  )
}

export default ({
  assetId = undefined,
  currentExtraData = undefined,
  onDone = undefined,
  overrideSave = undefined,
}: {
  assetId?: string
  currentExtraData?: ExtraData
  onDone?: () => void
  overrideSave?: (newExtraData: ExtraData) => void
}) => {
  const [isSaving, isSaveSuccess, isSaveError, save] = useDataStoreEdit<Asset>(
    CollectionNames.Assets,
    assetId || false
  )
  const [newExtraData, setNewExtraData] = useState<ExtraData>(
    currentExtraData || {
      vrcfury: {
        prefabs: [],
      },
    }
  )

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save vrcfury settings button')

      if (overrideSave) {
        overrideSave(newExtraData)

        if (onDone) {
          onDone()
        }
        return
      }

      await save({
        extradata: newExtraData,
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
    return <LoadingIndicator message="Saving asset..." />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save asset</ErrorMessage>
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage controls={<Button onClick={onDone}>Reload asset</Button>}>
        Settings saved successfully
      </SuccessMessage>
    )
  }

  const setField = (fieldName: keyof VrcFurySettings, newVal: any) => {
    setNewExtraData((currentVal) => ({
      ...currentVal,
      vrcfury: {
        ...currentVal.vrcfury,
        [fieldName]: newVal,
      },
    }))
  }

  const prefabs = newExtraData.vrcfury.prefabs

  return (
    <>
      <ItemsEditor<VrcFuryPrefabInfo>
        items={prefabs}
        onChange={(newPrefabs) => setField('prefabs', newPrefabs)}
        editor={PrefabEditor}
        renderer={PrefabRenderer}
        emptyItem={{
          url: '',
          discordServerId: undefined,
        }}
      />
      <FormControls>
        <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
    </>
  )
}
