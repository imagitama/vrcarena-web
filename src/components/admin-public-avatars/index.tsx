import React, { useState } from 'react'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import SaveIcon from '@material-ui/icons/Save'

import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'
import { updateRecords } from '../../data-store'
import SuccessMessage from '../success-message'
import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import useTimer from '../../hooks/useTimer'
import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from '../../modules/assets'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import VrchatAvatar from '../vrchat-avatar'
import { VrchatAvatar as VrchatAvatarData } from '../../vrchat'
import AssetResultsItem from '../asset-results-item'
import Button from '../button'
import CheckboxInput from '../checkbox-input'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import {
  CollectionNames,
  FullPublicAvatarSubmission,
} from '../../modules/public-avatar-submissions'
import { VrchatAvatarCachedItem } from '../../modules/vrchat-cache'
import useSupabaseClient from '../../hooks/useSupabaseClient'

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
        data: { error, successfulAvatarIds },
      } = await callFunction<{}, SyncMissingAvatarSubmissionsResult>(
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
  onDone,
}: {
  assetId: string
  newAvatarIds: string[]
  onDone: () => void
}) => {
  const [isSavingAsset, isSavingSuccessAsset, isSavingErrorAsset, saveAsset] =
    useDataStoreEdit<Asset>(AssetsCollectionNames.Assets, assetId)

  const add = async () => {
    try {
      await saveAsset({
        vrchatclonableavatarids: newAvatarIds,
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
  isDeleted: 'isdeleted',
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
  onDone,
}: {
  assetId: string
  existingAvatarIds: string[]
  existingAvatarData: VrchatAvatarCachedItem[]
  submissions: FullPublicAvatarSubmission[]
  onDone: () => void
}) => {
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<string[]>(
    existingAvatarIds || []
  )
  const [isSavingSubmissions, setIsSavingSubmissions] = useState(false)
  const [isSavingSuccess, setIsSavingSuccess] = useState(false)
  const onDoneAfterDelay = useTimer(() => onDone(), 2000)
  const supabase = useSupabaseClient()

  const onSelect = (id: string) =>
    setSelectedAvatarIds((currentIds) => currentIds.concat([id]))
  const onDeselect = (id: string) =>
    setSelectedAvatarIds((currentIds) =>
      currentIds.filter((currentId) => currentId !== id)
    )

  const deleteSubmissions = async () => {
    console.debug(
      `Deleting submissions ${submissions
        .map((submission) => submission.id)
        .join(', ')}...`
    )

    setIsSavingSubmissions(true)
    setIsSavingSuccess(false)

    await updateRecords<{ isdeleted: boolean }>(
      supabase,
      CollectionNames.PublicAvatarSubmissions,
      submissions.map((submission) => submission.id),
      {
        isdeleted: true,
      }
    )

    setIsSavingSubmissions(false)
    setIsSavingSuccess(true)

    onDoneAfterDelay()

    console.debug(`Submissions deleted`)
  }

  const avatarListItems: AvatarListItem[] = existingAvatarIds
    ? existingAvatarIds.map((avatarId) => {
        const result = existingAvatarData.find((data) => data.id === avatarId)
        return {
          key: `${assetId}_${avatarId}`,
          isNew: false,
          avatarId: avatarId,
          avatar: result ? result.avatar : undefined,
        }
      })
    : []

  for (const submission of submissions) {
    avatarListItems.push({
      key: submission.id,
      isNew: true,
      avatarId: submission.vrchatavatarid,
      avatar: submission.avatar,
    })
  }

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {avatarListItems.map((avatarListItem, idx) => {
          const isDuplicate =
            avatarListItems.findIndex(
              (item) => item.avatarId === avatarListItem.avatarId
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
  const [isLoading, isErrored, results, hydrate] =
    useDatabaseQuery<FullPublicAvatarSubmission>(
      'getFullPublicAvatarSubmissions'.toLowerCase(),
      [['isdeleted', Operators.EQUALS, false]]
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
    [assetId: string]: FullPublicAvatarSubmission[]
  } = results.reduce(
    (
      finalResults: { [assetId: string]: FullPublicAvatarSubmission[] },
      result: FullPublicAvatarSubmission
    ) => ({
      ...finalResults,
      [result.asset]:
        result.asset in finalResults
          ? finalResults[result.asset].concat([result])
          : [result],
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
                  {/* @ts-ignore */}
                  <AssetResultsItem asset={submissions[0]} />
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
