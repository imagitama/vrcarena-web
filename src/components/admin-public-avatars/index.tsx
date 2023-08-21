import React, { useState } from 'react'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import SaveIcon from '@material-ui/icons/Save'

import useDatabaseQuery, {
  AssetFieldNames,
  CollectionNames as OldCollectionNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import { CollectionNames, updateRecords } from '../../data-store'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import VrchatAvatar, {
  VrchatAvatar as VrchatAvatarData
} from '../vrchat-avatar'
import AssetResultsItem from '../asset-results-item'
import Button from '../button'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import SuccessMessage from '../success-message'
import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import CheckboxInput from '../checkbox-input'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import useTimer from '../../hooks/useTimer'

export interface CachedVrchatAvatarRecord {
  id: string
  avatar: VrchatAvatarData
}

interface GetFullPublicAvatarSubmissions {
  id: string
  asset: string
  vrchatavatarid: string
  createdat: Date
  createdby: string
  // joined
  creatorname: string
  title: string
  thumbnailurl: string
  existingavatarids: string[]
  existingavatardata: CachedVrchatAvatarRecord[]
  avatar?: VrchatAvatarData
}

interface SyncMissingAvatarSubmissionsResult {
  success: boolean
  successfulAvatarIds: string[]
  error?: string
}

const SyncForm = ({ onDone }: { onDone: () => void }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastErrorMessage, setLastErrorMessage] = useState('')
  const [syncedIds, setSyncedIds] = useState<null | string[]>(null)

  const sync = async () => {
    try {
      setIsLoading(true)
      setSyncedIds(null)
      setLastErrorMessage('')

      const {
        data: { error, successfulAvatarIds }
      } = await callFunction<SyncMissingAvatarSubmissionsResult>(
        'syncMissingAvatarSubmissions'
      )

      setIsLoading(false)

      if (error) {
        throw new Error(error)
      } else {
        setSyncedIds(successfulAvatarIds)
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)

      setIsLoading(false)
      setLastErrorMessage(err instanceof Error ? err.message : 'unknown')
      setSyncedIds(null)
    }
  }

  return (
    <Paper style={{ padding: '1rem ' }}>
      <em>VRChat avatars are automatically synced every 30 minutes</em>
      {lastErrorMessage ? (
        <ErrorMessage>{lastErrorMessage}</ErrorMessage>
      ) : null}
      {isLoading ? <LoadingIndicator message="Syncing..." /> : null}
      {syncedIds ? (
        <SuccessMessage>
          Synced {syncedIds.length} VRChat avatars
        </SuccessMessage>
      ) : null}
      <Button onClick={sync} isDisabled={isLoading}>
        Manually Sync VRChat Avatars
      </Button>
    </Paper>
  )
}

const AddToAssetButton = ({
  assetId,
  newAvatarIds,
  onDone
}: {
  assetId: string
  newAvatarIds: string[]
  onDone: () => void
}) => {
  const [
    isSavingAsset,
    isSavingSuccessAsset,
    isSavingErrorAsset,
    saveAsset
  ] = useDatabaseSave(OldCollectionNames.Assets, assetId)

  const add = async () => {
    try {
      await saveAsset({
        [AssetFieldNames.vrchatClonableAvatarIds]: newAvatarIds
      })

      onDone()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (isSavingAsset) {
    return <LoadingIndicator message={'Adding to asset...'} />
  }

  if (isSavingErrorAsset) {
    return <ErrorMessage>Failed to edit asset</ErrorMessage>
  }

  if (isSavingSuccessAsset) {
    return <SuccessMessage>Asset saved successfully</SuccessMessage>
  }

  return (
    <Button onClick={() => add()} size="large" icon={<SaveIcon />}>
      Save Asset
    </Button>
  )
}

const PublicAvatarSubmissionsFieldNames = {
  isDeleted: 'isdeleted'
}

interface AvatarListItem {
  key: string
  isNew: boolean
  avatarId: string
  avatar?: VrchatAvatarData
}

const ApplyAvatarsForm = ({
  assetId,
  existingAvatarIds,
  existingAvatarData,
  submissions,
  onDone
}: {
  assetId: string
  existingAvatarIds: string[]
  existingAvatarData: CachedVrchatAvatarRecord[]
  submissions: GetFullPublicAvatarSubmissions[]
  onDone: () => void
}) => {
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<string[]>(
    existingAvatarIds || []
  )
  const [isSavingSubmissions, setIsSavingSubmissions] = useState(false)
  const [isSavingSuccess, setIsSavingSuccess] = useState(false)
  const onDoneAfterDelay = useTimer(() => onDone(), 2000)

  const onSelect = (id: string) =>
    setSelectedAvatarIds(currentIds => currentIds.concat([id]))
  const onDeselect = (id: string) =>
    setSelectedAvatarIds(currentIds =>
      currentIds.filter(currentId => currentId !== id)
    )

  const deleteSubmissions = async () => {
    console.debug(
      `Deleting submissions ${submissions
        .map(submission => submission.id)
        .join(', ')}...`
    )

    setIsSavingSubmissions(true)
    setIsSavingSuccess(false)

    await updateRecords<{ isdeleted: boolean }>(
      CollectionNames.PublicAvatarSubmissions,
      submissions.map(submission => submission.id),
      {
        isdeleted: true
      }
    )

    setIsSavingSubmissions(false)
    setIsSavingSuccess(true)

    onDoneAfterDelay()

    console.debug(`Submissions deleted`)
  }

  const avatarListItems: AvatarListItem[] = existingAvatarIds
    ? existingAvatarIds.map(avatarId => {
        const result = existingAvatarData.find(data => data.id === avatarId)
        return {
          key: `${assetId}_${avatarId}`,
          isNew: false,
          avatarId: avatarId,
          avatar: result ? result.avatar : undefined
        }
      })
    : []

  for (const submission of submissions) {
    avatarListItems.push({
      key: submission.id,
      isNew: true,
      avatarId: submission.vrchatavatarid,
      avatar: submission.avatar
    })
  }

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {avatarListItems.map((avatarListItem, idx) => {
          const isDuplicate =
            avatarListItems.findIndex(
              item => item.avatarId === avatarListItem.avatarId
            ) !== idx
          return (
            <div key={avatarListItem.key}>
              <CheckboxInput
                isDisabled={isDuplicate}
                value={selectedAvatarIds.includes(avatarListItem.avatarId)}
                onChange={(newVal: boolean) => {
                  if (newVal) {
                    onSelect(avatarListItem.avatarId)
                  } else {
                    onDeselect(avatarListItem.avatarId)
                  }
                }}
                label={
                  isDuplicate
                    ? 'Duplicate'
                    : avatarListItem.isNew
                    ? 'Add To Avatar'
                    : 'Keep'
                }
              />
              <VrchatAvatar
                avatarId={avatarListItem.avatarId}
                avatarData={avatarListItem.avatar}
                allowFetch
              />
            </div>
          )
        })}
      </div>
      {isSavingSubmissions ? (
        <LoadingIndicator message="Updating submissions..." />
      ) : null}
      {isSavingSuccess ? (
        <SuccessMessage>Submissions saved, hydrating...</SuccessMessage>
      ) : null}
      <AddToAssetButton
        assetId={assetId}
        newAvatarIds={selectedAvatarIds}
        onDone={deleteSubmissions}
      />
    </>
  )
}

const Avatars = () => {
  const [isLoading, isErrored, results, hydrate] = useDatabaseQuery(
    'getFullPublicAvatarSubmissions'.toLowerCase(),
    [[PublicAvatarSubmissionsFieldNames.isDeleted, Operators.EQUALS, false]]
  )

  if (isLoading || !Array.isArray(results)) {
    return <LoadingIndicator message="Loading avatars..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load avatars</ErrorMessage>
  }

  if (!results.length) {
    return <ErrorMessage>No avatars found for query</ErrorMessage>
  }

  const resultsByAssetId: {
    [assetId: string]: GetFullPublicAvatarSubmissions[]
  } = results.reduce(
    (
      finalResults: { [assetId: string]: GetFullPublicAvatarSubmissions[] },
      result: GetFullPublicAvatarSubmissions
    ) => ({
      ...finalResults,
      [result.asset]:
        result.asset in finalResults
          ? finalResults[result.asset].concat([result])
          : [result]
    }),
    {}
  )

  const onSynced = () => hydrate()

  return (
    <>
      <SyncForm onDone={onSynced} />
      <br />
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell>Avatars</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(resultsByAssetId).map(([assetId, submissions]) => (
              <TableRow key={assetId}>
                <TableCell>
                  <AssetResultsItem
                    // @ts-ignore
                    asset={{
                      id: submissions[0].asset,
                      [AssetFieldNames.title]: submissions[0].title,
                      [AssetFieldNames.thumbnailUrl]:
                        submissions[0].thumbnailurl
                    }}
                  />
                </TableCell>
                <TableCell>
                  <ApplyAvatarsForm
                    assetId={assetId}
                    existingAvatarIds={submissions[0].existingavatarids}
                    existingAvatarData={submissions[0].existingavatardata}
                    submissions={submissions}
                    onDone={hydrate}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  )
}

export default () => {
  return (
    <div>
      <Avatars />
    </div>
  )
}
