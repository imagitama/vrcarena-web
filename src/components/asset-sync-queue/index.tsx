import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'

import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import LaunchIcon from '@mui/icons-material/Launch'
import EditIcon from '@mui/icons-material/Edit'
import InfoIcon from '@mui/icons-material/Info'
import CheckIcon from '@mui/icons-material/Check'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import useIsEditor from '@/hooks/useIsEditor'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import useSupabaseClient from '@/hooks/useSupabaseClient'
import useDataStoreCreateBulk from '@/hooks/useDataStoreCreateBulk'
import useDataStoreItemSync from '@/hooks/useDataStoreItemSync'
import useDataStoreDelete from '@/hooks/useDataStoreDelete'

import { VRCArenaTheme } from '@/themes'
import { Warning as WarningIcon } from '@/icons'
import { cleanupSourceUrl, getCanSync } from '@/syncing'
import { getFriendlyDate } from '@/utils/dates'
import { capitalize } from '@/utils'
import { DISCORD_URL, colorPalette } from '@/config'
import * as routes from '@/routes'
import {
  AssetSyncQueueItem,
  AssetSyncQueueItemFields,
  CollectionNames,
  QueueStatus,
  FullAssetSyncQueueItem,
} from '@/modules/assetsyncqueue'
import { Asset, FullAsset, ViewNames } from '@/modules/assets'
import { DataStoreErrorCode, updateRecord } from '@/data-store'
import { handleError } from '@/error-handling'

import FormControls from '@/components/form-controls'
import WarningMessage from '@/components/warning-message'
import UsernameLink from '@/components/username-link'
import FormattedDate from '@/components/formatted-date'
import StatusText from '@/components/status-text'
import AssetEditorDialog from '@/components/asset-editor-dialog'
import AssetResultsItem from '@/components/asset-results-item'
import TextInput from '@/components/text-input'
import Tooltip from '@/components/tooltip'
import CopyThing from '@/components/copy-thing'
import SuccessMessage from '@/components/success-message'
import LoadingShimmer from '@/components/loading-shimmer'
import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import Button from '@/components/button'
import FailureInfoOutput from '../failure-info-output'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  queuedStatus: {
    fontWeight: 'bold',
  },
  failed: {
    color: colorPalette.negative,
  },
  processing: {
    color: colorPalette.warning,
  },
  success: {
    color: colorPalette.positive,
  },
  waiting: {},
  failedFieldsRoot: {
    margin: '0.5rem 0 0.25rem',
    borderRadius: theme.shape.borderRadius,
  },
  deletedRow: {
    opacity: 0.5,
  },
}))

const getClassForStatus = (
  status: QueueStatus,
  classes: ReturnType<typeof useStyles>
): string => {
  switch (status) {
    case QueueStatus.Failed:
      return classes.failed
    case QueueStatus.Processing:
      return classes.processing
    case QueueStatus.Processed:
      return classes.success
    case QueueStatus.Queued:
      return classes.waiting
    default:
      return ''
  }
}

const twentyFourHours = Date.now() - 24 * 60 * 60 * 1000

const getIsQueuedItemTakingTooLong = (
  queuedItem: AssetSyncQueueItem
): boolean =>
  queuedItem.status === QueueStatus.Queued &&
  new Date(queuedItem.createdat).getTime() < twentyFourHours

const QueuedStatus = ({ queuedItem }: { queuedItem: AssetSyncQueueItem }) => {
  const classes = useStyles()

  return (
    <span
      className={`${classes.queuedStatus} ${getClassForStatus(
        queuedItem.status,
        classes
      )}`}>
      {capitalize(queuedItem.status)}{' '}
      <CopyThing
        text={queuedItem.id}
        title={
          <>
            Queued {getFriendlyDate(new Date(queuedItem.createdat))}
            {queuedItem.lastmodifiedat &&
            queuedItem.lastmodifiedat !== queuedItem.createdat ? (
              <>
                <br />
                Last updated{' '}
                {getFriendlyDate(new Date(queuedItem.lastmodifiedat))}
              </>
            ) : null}
            {queuedItem.status === QueueStatus.Failed &&
            queuedItem.failureinfo ? (
              <>
                <br />
                Failed: {JSON.stringify(queuedItem.failureinfo)}
              </>
            ) : (
              ''
            )}
          </>
        }>
        <InfoIcon />
      </CopyThing>
      {queuedItem.status === QueueStatus.Failed &&
        queuedItem.failureinfo !== null && (
          <FailureInfoOutput failureInfo={queuedItem.failureinfo} />
        )}
      {getIsQueuedItemTakingTooLong(queuedItem) ? (
        <WarningMessage title="Something went wrong">
          This item has been waiting for more than 24 hours. Please open a
          support ticket in our <a href={DISCORD_URL}>Discord</a> (with a
          screenshot) or create the asset manually.
        </WarningMessage>
      ) : null}
    </span>
  )
}

const DeleteButton = ({
  queuedItem,
  isBusy,
  onDelete,
}: {
  queuedItem: AssetSyncQueueItem
  isBusy: boolean
  onDelete: () => void
}) => {
  const [isDeleting, isSuccess, lastErrorCode, performDelete] =
    useDataStoreDelete(CollectionNames.AssetSyncQueue, queuedItem.id, {
      queryName: 'delete-queued-item-button',
    })

  const onClickDelete = async () => {
    await performDelete()
    onDelete()
  }

  return (
    <>
      <Button
        color="secondary"
        icon={<DeleteIcon className="test" />}
        iconOnly
        onClick={onClickDelete}
        title="Remove asset from queue (does not delete any asset drafts)"
        isDisabled={
          isBusy || isDeleting || queuedItem.status === QueueStatus.Processing
        }
        hollow
      />
      {isSuccess ? (
        <SuccessMessage>Item removed from queue</SuccessMessage>
      ) : lastErrorCode !== null ? (
        <ErrorMessage>Failed to remove item from queue</ErrorMessage>
      ) : isDeleting ? (
        <LoadingIndicator message="Removing..." />
      ) : null}
    </>
  )
}

const LoadingRow = () => (
  <TableRow>
    <TableCell width="60%">
      <LoadingShimmer width="100%" height="15px" />
    </TableCell>
    <TableCell width="20%">
      <LoadingShimmer width="100%" height="15px" />
    </TableCell>
    <TableCell width="20%">
      <LoadingShimmer width="100%" height="15px" />
    </TableCell>
  </TableRow>
)

interface ImportantField {
  name: Extract<keyof Asset, string>
  description: string
}

const importantFields: ImportantField[] = [
  {
    name: 'category',
    description: 'Category',
  },
  {
    name: 'isadult',
    description: 'If it is NSFW/adult',
  },
  {
    name: 'species',
    description: 'Species',
  },
  {
    name: 'tags',
    description: 'Tags',
  },
  {
    name: 'vrchatclonableavatarids',
    description: 'Any VRChat avatars you can clone',
  },
  {
    name: 'relations',
    description: 'If it depends on another asset (relations)',
  },
]

const MissingFields = ({ queuedItem }: { queuedItem: AssetSyncQueueItem }) => {
  const syncedFieldNames = queuedItem.syncedfields!
  const classes = useStyles()

  return (
    <div className={classes.failedFieldsRoot}>
      <small>
        <WarningIcon /> These fields could not be synced:
        <ul>
          {importantFields
            .filter(
              (fieldInfo) =>
                syncedFieldNames.find(
                  (syncedFieldName) => syncedFieldName === fieldInfo.name
                ) === undefined
            )
            .map((fieldInfo) => (
              <li key={fieldInfo.name}>{fieldInfo.description}</li>
            ))}
          {queuedItem.syncedfields?.includes('vrchatclonableavatarids') ? (
            <li>
              VRChat avatar URLs were detected but need to be manually synced
            </li>
          ) : null}
        </ul>
      </small>
    </div>
  )
}

const QueuedItemRow = ({
  queuedItem: originalQueuedItem,
  isBusy,
  showMoreInfo,
  hydrate,
}: {
  queuedItem: AssetSyncQueueItem | FullAssetSyncQueueItem
  isBusy: boolean
  showMoreInfo?: boolean
  hydrate?: () => void
}) => {
  const [isSubscribing, isSubscribed, lastSubscribeErrorCode, liveQueuedItem] =
    useDataStoreItemSync<AssetSyncQueueItem>(
      CollectionNames.AssetSyncQueue,
      originalQueuedItem.id,
      `get-my-asset-sync-queued-item_${originalQueuedItem.id}_SYNCED`
    )
  const [isDeleted, setIsDeleted] = useState(false)
  const classes = useStyles()
  const client = useSupabaseClient()
  const [isEditingAsset, setIsEditingAsset] = useState(false)
  const queuedItem = liveQueuedItem || originalQueuedItem
  const [, , fullAsset, hydrateAsset] = useDataStoreItem<FullAsset>(
    ViewNames.GetFullAssets,
    queuedItem.createdassetid || false
  )
  const isEditor = useIsEditor()

  const onDelete = () => setIsDeleted(true)

  const onClickToggleEdit = () => setIsEditingAsset((currentVal) => !currentVal)

  if (isSubscribing) {
    return <LoadingRow />
  }

  const onRetry = async () => {
    try {
      console.log('Retrying...')

      if (queuedItem.status === QueueStatus.Queued) {
        console.debug(
          'Status already "waiting" so forcing it by failing it then resetting back'
        )

        console.debug(
          'Result:',
          await updateRecord(
            client,
            CollectionNames.AssetSyncQueue,
            queuedItem.id,
            {
              status: QueueStatus.Failed,
            }
          )
        )

        console.debug('Waiting a moment')

        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      console.debug(
        'Setting it to "waiting" triggers the special "try it again" function ;)'
      )

      console.debug(
        'Result:',
        await updateRecord(
          client,
          CollectionNames.AssetSyncQueue,
          queuedItem.id,
          {
            status: QueueStatus.Queued,
          }
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <TableRow className={`${isDeleted ? classes.deletedRow : ''}`}>
        <TableCell width="60%">
          <strong>{queuedItem.sourceurl}</strong>{' '}
          <a
            href={queuedItem.sourceurl}
            target="_blank"
            rel="noopener noreferrer">
            <LaunchIcon />
          </a>
          <br />
          <small>
            <FormattedDate
              date={queuedItem.lastmodifiedat || queuedItem.createdat}
            />
          </small>
          {fullAsset ? (
            <>
              <br />
              <br />
              <AssetResultsItem asset={fullAsset} showMoreInfo showState />
            </>
          ) : null}
        </TableCell>
        <TableCell width="20%">
          <QueuedStatus queuedItem={queuedItem} />
          {queuedItem.status === QueueStatus.Processed ? (
            <>
              <br />
              <small>
                <WarningIcon /> You must submit your asset for approval (by
                editing it below)
              </small>
              <br />
              {queuedItem.syncedfields && queuedItem.syncedfields.length ? (
                <MissingFields queuedItem={queuedItem} />
              ) : null}
              <Button
                onClick={onClickToggleEdit}
                icon={<EditIcon />}
                size="small"
                color="secondary">
                Edit Asset
              </Button>
              {isEditingAsset && (
                <AssetEditorDialog
                  onClose={() => {
                    hydrateAsset()
                    setIsEditingAsset(false)
                  }}
                  assetId={queuedItem.createdassetid}
                />
              )}
            </>
          ) : null}
          {lastSubscribeErrorCode !== null && hydrate ? (
            <Button size="small" color="secondary" onClick={hydrate}>
              Refresh
            </Button>
          ) : null}
          {showMoreInfo &&
          queuedItem.createdby &&
          queuedItem.createdbyusername ? (
            <>
              <br />
              Queued by{' '}
              <UsernameLink
                username={
                  (queuedItem as FullAssetSyncQueueItem).createdbyusername
                }
                id={queuedItem.createdby}
              />{' '}
              <FormattedDate date={queuedItem.createdat} />
            </>
          ) : null}
        </TableCell>
        <TableCell width="20%">
          <DeleteButton
            queuedItem={queuedItem}
            isBusy={isBusy}
            onDelete={onDelete}
          />
          {showMoreInfo && (
            <>
              {' '}
              <Button onClick={onRetry} color="tertiary">
                (Admin Only) Retry
              </Button>
            </>
          )}
        </TableCell>
      </TableRow>
    </>
  )
}

const oneWeekAgo = new Date()
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

const BulkEditor = ({ onAdd }: { onAdd: (urls: string[]) => void }) => {
  const [textVal, setTextVal] = useState('')

  const onClickDone = () => {
    if (!textVal) {
      console.warn('no text val')
      return
    }

    const urls = textVal
      .split('\n')
      .filter((line) => line)
      .map((line) => line.trim())

    if (!urls.length) {
      console.warn('no URLs')
      return
    }

    onAdd(urls)
    setTextVal('')
  }

  return (
    <>
      <TextInput
        fullWidth
        minRows={20}
        value={textVal}
        onChange={(e) => setTextVal(e.target.value)}
        placeholder={`Paste a list of product URLs here eg.\nhttps://reval.gumroad.com/l/furpaw\nhttps://jinxxy.com/LegacyTwoTails/Astrawolf\nhttps://tzapfronpresents.itch.io/furry-dog`}
      />{' '}
      <br />
      <Button onClick={() => onClickDone()} icon={<CheckIcon />}>
        Bulk Add
      </Button>
    </>
  )
}

const AssetSyncQueue = ({
  items,
  isLoading,
  lastErrorCode,
  hydrate,
  showMoreInfo,
}: {
  items: AssetSyncQueueItem[] | null
  isLoading?: boolean
  lastErrorCode?: DataStoreErrorCode | null
  hydrate?: () => void
  showMoreInfo?: boolean
}) => {
  const [newSourceUrls, setSourceUrls] = useState([''])
  const [isCreating, , lastCreateErrorCode, create] =
    useDataStoreCreateBulk<AssetSyncQueueItem>(CollectionNames.AssetSyncQueue, {
      queryName: 'add-asset-sync-queue-items',
    })
  const [isBulkEditorVisible, setIsBulkEditorVisible] = useState(false)

  const toggleBulkAdd = () =>
    setIsBulkEditorVisible((currentVal) => !currentVal)

  const updateSourceUrl = (index: number, newUrl: string) =>
    setSourceUrls((currentUrls) =>
      currentUrls.map((url, i) => (i === index ? newUrl : url))
    )

  const removeSourceUrl = (index: number) =>
    setSourceUrls((currentUrls) => currentUrls.filter((url, i) => i !== index))

  const addEmptySource = () => setSourceUrls((urls) => urls.concat(['']))

  let validSourceUrls = newSourceUrls.filter(getCanSync)
  validSourceUrls = validSourceUrls.filter(
    (sourceUrl, i) => validSourceUrls.indexOf(sourceUrl) === i
  )

  const processItems = async () => {
    try {
      const records: Partial<AssetSyncQueueItemFields>[] = []

      for (const url of validSourceUrls) {
        const cleanedUrl = cleanupSourceUrl(url)

        if (!getCanSync(cleanedUrl)) {
          console.warn(
            `Tried to insert record but URL appears to not be syncable: ${cleanedUrl}`
          )
          continue
        }

        console.debug(`Inserting record to trigger sync for URL: ${cleanedUrl}`)

        records.push({
          sourceurl: cleanedUrl,
        })
      }

      console.debug(`Creating URLs...`, records)

      const createdRecords = await create(records)

      console.debug(
        `Created URLs and got IDs: ${createdRecords
          .map((record) => record.id)
          .join(', ')}`
      )

      if (hydrate) {
        hydrate()
      }

      setSourceUrls([])
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (lastErrorCode && lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load queued assets: {lastErrorCode}</ErrorMessage>
    )
  }

  const isBusy: boolean = isCreating || (isLoading ? isLoading : false)

  const onBulkAdd = (urls: string[]) => {
    setSourceUrls((currentUrls) => currentUrls.concat(urls))
  }

  return (
    <>
      <Table>
        {/* <TableHead>
          <TableRow>
            <TableCell width="60%">Source</TableCell>
            <TableCell width="20%"></TableCell>
            <TableCell width="20%">Controls</TableCell>
          </TableRow>
        </TableHead> */}
        <TableBody>
          {isLoading ? (
            <>
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </>
          ) : items ? (
            items.map((queuedItem) => (
              <QueuedItemRow
                key={queuedItem.id}
                queuedItem={queuedItem}
                isBusy={isBusy}
                showMoreInfo={showMoreInfo}
                hydrate={hydrate}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={999}>You have no assets queued</TableCell>
            </TableRow>
          )}
          {newSourceUrls.map((newSourceUrl, i) => {
            return (
              <TableRow key={i}>
                <TableCell>
                  <TextInput
                    label="Source URL"
                    value={newSourceUrl}
                    onChange={(e) => updateSourceUrl(i, e.target.value)}
                    fullWidth
                    placeholder="eg. https://rezilloryker.gumroad.com/l/Canis"
                    isDisabled={isBusy}
                  />
                </TableCell>
                <TableCell>
                  {getCanSync(newSourceUrl) ? (
                    <StatusText positivity={1}>
                      <CheckIcon /> Valid
                      <br />
                      {cleanupSourceUrl(newSourceUrl)}
                    </StatusText>
                  ) : newSourceUrl ? (
                    <>
                      <Tooltip title="Only product URLs (such as Gumroad, Booth, Jinxxy, Itch, PayHip) can be synced">
                        <StatusText positivity={-1}>
                          <ClearIcon /> Invalid
                        </StatusText>
                      </Tooltip>
                      <br />
                      <Button
                        url={routes.createAsset}
                        icon={<EditIcon />}
                        size="small"
                        color="secondary">
                        Create Asset Manually (redirects)
                      </Button>
                    </>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Button
                    color="secondary"
                    icon={<DeleteIcon />}
                    iconOnly
                    onClick={() => removeSourceUrl(i)}
                    isDisabled={isBusy}
                    title="Remove source"
                    hollow
                  />
                </TableCell>
              </TableRow>
            )
          })}
          <TableRow>
            <TableCell>
              {isBulkEditorVisible ? <BulkEditor onAdd={onBulkAdd} /> : null}
            </TableCell>
            <TableCell></TableCell>
            <TableCell>
              <Button
                onClick={addEmptySource}
                icon={<AddIcon />}
                isDisabled={isBusy}
                color="secondary"
                switchIconSide>
                Add Another
              </Button>{' '}
              <Button onClick={toggleBulkAdd} color="secondary">
                Add Bulk
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <FormControls>
        <Button
          onClick={processItems}
          size="large"
          icon={<CheckIcon />}
          isDisabled={isBusy || !validSourceUrls.length}>
          Add {validSourceUrls.length} Sources To Queue
        </Button>
        {lastCreateErrorCode !== null ? (
          <ErrorMessage>
            Failed to add to queue: {lastCreateErrorCode}
          </ErrorMessage>
        ) : null}
      </FormControls>
    </>
  )
}

export default AssetSyncQueue
