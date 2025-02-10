import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import DeleteIcon from '@material-ui/icons/Delete'
import AddIcon from '@material-ui/icons/Add'
import LaunchIcon from '@material-ui/icons/Launch'
import EditIcon from '@material-ui/icons/Edit'
import InfoIcon from '@material-ui/icons/Info'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import * as routes from '../../routes'

import Button from '../../components/button'
import NoPermissionMessage from '../../components/no-permission-message'

import useUserRecord from '../../hooks/useUserRecord'

import Link from '../../components/link'
import TextInput from '../../components/text-input'
import { cleanupSourceUrl, getCanSync } from '../../syncing'
import Tooltip from '../../components/tooltip'
import FormControls from '../../components/form-controls'
import { handleError } from '../../error-handling'
import {
  AssetSyncQueueItem,
  AssetSyncQueueItemFields,
  CollectionNames,
  ViewNames,
  AssetSyncStatus,
  Asset,
  FullAsset,
} from '../../modules/assets'
import useDataStoreCreateBulk from '../../hooks/useDataStoreCreateBulk'
import useDatabaseQuery, { OrderDirections } from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import LoadingShimmer from '../../components/loading-shimmer'
import { colorPalette } from '../../config'
import { capitalize } from '../../utils'
import useDataStoreDelete from '../../hooks/useDataStoreDelete'
import SuccessMessage from '../../components/success-message'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import { getFriendlyDate } from '../../utils/dates'
import useDataStoreItemSync from '../../hooks/useDataStoreItemSync'
import CopyThing from '../../components/copy-thing'
import ExperimentalMessage from '../../components/experimental-message'
import useHistory from '../../hooks/useHistory'
import useMyDrafts from '../../hooks/useMyDrafts'
import useSupabaseClient from '../../hooks/useSupabaseClient'
import { insertRecord } from '../../data-store'
import AssetResults from '../../components/asset-results'

const useStyles = makeStyles((theme) => ({
  heading: {
    textAlign: 'center',
    padding: '2rem 0',
    fontWeight: 'bold',
  },
  // rules
  acceptRulesButton: {
    textAlign: 'center',
    padding: '2rem 0',
  },
  // status
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
    border: `1px solid ${colorPalette.warning}`,
    color: colorPalette.warning,
    padding: '0.25rem',
    margin: '0.25rem 0',
    fontSize: '75%',
    borderRadius: theme.shape.borderRadius,
  },
  deletedRow: {
    opacity: 0.5,
  },
}))

const RulesForm = ({ onAccept }: { onAccept: () => void }) => {
  const classes = useStyles()

  return (
    <div>
      <div className={classes.heading}>
        By clicking "I accept" you understand and agree to our{' '}
        <Link to={routes.termsOfService}>Terms of Service</Link> and our{' '}
        <Link to={routes.takedownPolicy}>Takedown Policy</Link>.
      </div>
      <div className={classes.acceptRulesButton}>
        <Button size="large" icon={<CheckIcon />} onClick={onAccept}>
          I accept
        </Button>
      </div>
    </div>
  )
}

const ManualCreateView = () => {
  const [isCreating, setIsCreating] = useState(false)
  const [isError, setIsError] = useState(false)
  const classes = useStyles()
  const [isLoadingDrafts, isErrorLoadingDrafts, drafts] = useMyDrafts()
  const [showRules, setShowRules] = useState(false)
  const { push } = useHistory()
  const supabase = useSupabaseClient()
  const isLoggedIn = useIsLoggedIn()

  useEffect(() => {
    if (isLoadingDrafts || !drafts) {
      return
    }

    if (!drafts.length) {
      console.debug('No drafts detected, showing rules...')
      setShowRules(true)
    }
  }, [isLoadingDrafts, drafts ? drafts.length : null])

  const createDraft = async () => {
    try {
      setIsCreating(true)
      setIsError(false)

      const newDraftRecord = await insertRecord<{ title: string }, Asset>(
        supabase,
        CollectionNames.Assets,
        {
          title: 'My draft asset',
        },
        false
      )

      push(routes.editAssetWithVar.replace(':assetId', newDraftRecord.id))
    } catch (err) {
      console.error(err)
      handleError(err)

      setIsCreating(false)
      setIsError(true)
    }
  }

  const acceptRules = () => createDraft()

  const onCreateNewDraft = () => setShowRules(true)

  if (isLoadingDrafts) {
    return <LoadingIndicator message="Checking for existing drafts..." />
  }

  if (isErrorLoadingDrafts) {
    return <ErrorMessage>Failed to load existing drafts</ErrorMessage>
  }

  if (drafts && drafts.length && !showRules) {
    const onClickWithEventAndAsset = (
      e: React.SyntheticEvent,
      asset: FullAsset
    ) => {
      e.preventDefault()

      push(routes.editAssetWithVar.replace(':assetId', asset.id))

      return false
    }

    return (
      <>
        <div className={classes.heading}>We have detected these drafts:</div>
        <AssetResults
          assets={drafts}
          // @ts-ignore
          onClickWithEventAndAsset={onClickWithEventAndAsset}
        />
        <div className={classes.heading}>
          You can continue editing an existing draft or you can make a new one.
        </div>
        <FormControls>
          <Button
            size="large"
            icon={<ChevronRightIcon />}
            onClick={() => onCreateNewDraft()}>
            Create New Draft
          </Button>
        </FormControls>
      </>
    )
  }

  if (!isLoggedIn) {
    return <NoPermissionMessage />
  }

  if (isCreating) {
    return <LoadingIndicator message="Creating draft..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to create draft</ErrorMessage>
  }

  if (showRules) {
    return <RulesForm onAccept={acceptRules} />
  }

  return <>Waiting</>
}

const getClassForStatus = (
  status: AssetSyncStatus,
  classes: ReturnType<typeof useStyles>
): string => {
  switch (status) {
    case AssetSyncStatus.Failed:
      return classes.failed
    case AssetSyncStatus.Processing:
      return classes.processing
    case AssetSyncStatus.Success:
      return classes.success
    case AssetSyncStatus.Waiting:
      return classes.waiting
    default:
      return ''
  }
}

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
            {queuedItem.status === AssetSyncStatus.Failed &&
            queuedItem.failedreason ? (
              <>
                <br />
                Failed: {queuedItem.failedreason}
              </>
            ) : (
              ''
            )}
          </>
        }>
        <InfoIcon />
      </CopyThing>
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
        color="default"
        icon={<DeleteIcon className="test" />}
        iconOnly
        onClick={onClickDelete}
        title="Remove asset from queue"
        isDisabled={
          isBusy ||
          isDeleting ||
          queuedItem.status === AssetSyncStatus.Processing
        }
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
    <TableCell>
      <LoadingShimmer width="100%" height="15px" />
    </TableCell>
    <TableCell>
      <LoadingShimmer width="100%" height="15px" />
    </TableCell>
    <TableCell>
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
      These fields require your manual attention:
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
    </div>
  )
}

const QueuedItemRow = ({
  queuedItem: originalQueuedItem,
  isBusy,
}: {
  queuedItem: AssetSyncQueueItem
  isBusy: boolean
}) => {
  const [isSubscribing, lastSubscribeErrorCode, liveQueuedItem] =
    useDataStoreItemSync<AssetSyncQueueItem>(
      CollectionNames.AssetSyncQueue,
      originalQueuedItem.id,
      `get-my-asset-sync-queued-item_${originalQueuedItem.id}_SYNCED`
    )
  const [isDeleted, setIsDeleted] = useState(false)
  const classes = useStyles()

  const onDelete = () => setIsDeleted(true)

  const queuedItem = liveQueuedItem || originalQueuedItem

  if (isSubscribing) {
    return <LoadingRow />
  }

  if (lastSubscribeErrorCode !== null) {
    return (
      <TableRow>
        <TableCell colSpan={999}>
          <ErrorMessage>
            Failed to subscribe: {lastSubscribeErrorCode}
          </ErrorMessage>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow className={`${isDeleted ? classes.deletedRow : ''}`}>
      <TableCell>
        {queuedItem.sourceurl}{' '}
        <a
          href={queuedItem.sourceurl}
          target="_blank"
          rel="noopener noreferrer">
          <LaunchIcon />
        </a>
      </TableCell>
      <TableCell>
        <QueuedStatus queuedItem={queuedItem} />
        {queuedItem.status === AssetSyncStatus.Success ? (
          <>
            <br />
            {queuedItem.syncedfields && queuedItem.syncedfields.length ? (
              <MissingFields queuedItem={queuedItem} />
            ) : null}
            <Button
              url={routes.viewAssetWithVar.replace(
                ':assetId',
                queuedItem.createdassetid
              )}
              size="small"
              color="default">
              View Asset
            </Button>
          </>
        ) : null}
      </TableCell>
      <TableCell>
        <DeleteButton
          queuedItem={queuedItem}
          isBusy={isBusy}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  )
}

const View = () => {
  const [showRules, setShowRules] = useState(true)
  const [newSourceUrls, setSourceUrls] = useState([''])
  const [isCreating, isCreateSuccess, lastCreateErrorCode, create] =
    useDataStoreCreateBulk<AssetSyncQueueItem>(CollectionNames.AssetSyncQueue, {
      queryName: 'add-asset-sync-queue-items',
    })
  const [isLoading, lastErrorCode, queuedItems, hydrate] =
    useDatabaseQuery<AssetSyncQueueItem>(
      ViewNames.GetMyAssetSyncQueuedItems,
      [],
      {
        queryName: 'get-my-asset-sync-queued-items',
        orderBy: ['createdat', OrderDirections.DESC],
      }
    )

  const acceptRules = () => setShowRules(false)

  if (showRules) {
    return <RulesForm onAccept={acceptRules} />
  }

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
      const records: AssetSyncQueueItemFields[] = []

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

      hydrate()

      setSourceUrls([])
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load queued assets: {lastErrorCode}</ErrorMessage>
    )
  }

  const isBusy = isCreating || isLoading

  return (
    <>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="60%">Source</TableCell>
              <TableCell width="20%"></TableCell>
              <TableCell width="20%">Controls</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <>
                <LoadingRow />
                <LoadingRow />
                <LoadingRow />
              </>
            ) : queuedItems ? (
              queuedItems.map((queuedItem) => (
                <QueuedItemRow
                  key={queuedItem.id}
                  queuedItem={queuedItem}
                  isBusy={isBusy}
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
                      <>
                        <CheckIcon /> Can Be Synced
                        <br />
                        {cleanupSourceUrl(newSourceUrl)}
                      </>
                    ) : newSourceUrl ? (
                      <>
                        <Tooltip title="Only Gumroad, Booth and Itch.io URLs can be synced">
                          <span>
                            <ClearIcon /> Cannot Be Synced
                          </span>
                        </Tooltip>
                        <br />
                        <Button
                          url={routes.createAsset}
                          icon={<EditIcon />}
                          size="small"
                          color="default">
                          Create Manually
                        </Button>
                      </>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Button
                      color="default"
                      icon={<DeleteIcon />}
                      iconOnly
                      onClick={() => removeSourceUrl(i)}
                      isDisabled={isBusy}
                      title="Remove source"
                    />
                  </TableCell>
                </TableRow>
              )
            })}
            <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>
                <Button
                  onClick={addEmptySource}
                  icon={<AddIcon />}
                  isDisabled={isBusy}
                  color="default"
                  switchIconSide>
                  Add Another
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
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

export default () => {
  const isLoggedIn = useIsLoggedIn()
  const [isCreatingManually, setIsCreatingManually] = useState(false)

  if (!isLoggedIn) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Helmet>
        <title>Upload a new asset to the site | VRCArena</title>
        <meta
          name="description"
          content="Complete the form, submit it for approval and your asset will be visible on the site."
        />
      </Helmet>
      {isCreatingManually ? (
        <ManualCreateView />
      ) : (
        <>
          <ExperimentalMessage title="Asset Queue">
            This is the new way of syncing assets with Gumroad, Itch.io, Jinxxy
            and Booth. It now happens <em>in the background</em>, you can add
            multiple at a time and syncs more fields.
            <br />
            <br />
            Please DM me on Discord: @nutterbuddha with any feedback about the
            new system.
            <br />
            <br />
            <Button
              onClick={() => setIsCreatingManually(true)}
              color="default"
              size="small">
              Create Asset Manually (old way)
            </Button>
          </ExperimentalMessage>
          <View />
        </>
      )}
    </>
  )
}
