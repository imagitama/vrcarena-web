import React, { useState } from 'react'
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

import * as routes from '../../routes'

import Button from '../../components/button'
import NoPermissionMessage from '../../components/no-permission-message'

import useUserRecord from '../../hooks/useUserRecord'

import Link from '../../components/link'
import TextInput from '../../components/text-input'
import { getCanSync } from '../../syncing'
import Tooltip from '../../components/tooltip'
import FormControls from '../../components/form-controls'
import { handleError } from '../../error-handling'
import {
  AssetSyncQueueItem,
  AssetSyncQueueItemFields,
  CollectionNames,
  ViewNames,
  AssetSyncStatus,
} from '../../modules/assets'
import useDataStoreCreateBulk from '../../hooks/useDataStoreCreateBulk'
import useDataStoreItemsSync from '../../hooks/useDataStoreItemsSync'
import useDatabaseQuery from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import LoadingShimmer from '../../components/loading-shimmer'
import { colorPalette } from '../../config'
import { capitalize } from '../../utils'
import useDataStoreDelete from '../../hooks/useDataStoreDelete'
import SuccessMessage from '../../components/success-message'

const useStyles = makeStyles({
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
})

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

const QueuedStatus = ({ status }: { status: AssetSyncStatus }) => {
  const classes = useStyles()

  return (
    <span
      className={`${classes.queuedStatus} ${getClassForStatus(
        status,
        classes
      )}`}>
      {capitalize(status)}
    </span>
  )
}

const DeleteButton = ({
  queuedItem,
  isBusy,
}: {
  queuedItem: AssetSyncQueueItem
  isBusy: boolean
}) => {
  const [isDeleting, isSuccess, lastErrorCode, performDelete] =
    useDataStoreDelete(CollectionNames.AssetSyncQueue, queuedItem.id, {
      queryName: 'delete-queued-item-button',
    })

  return (
    <>
      <Button
        color="default"
        icon={<DeleteIcon className="test" />}
        iconOnly
        onClick={() => performDelete()}
        title="Remove asset from queue"
        isDisabled={isBusy || isDeleting}
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

const View = () => {
  const [, , user] = useUserRecord()
  const [showRules, setShowRules] = useState(false)
  const [newSourceUrls, setSourceUrls] = useState([''])
  const [
    isCreating,
    isCreateSuccess,
    lastCreateErrorCode,
    create,
    clear,
    createdDocs,
  ] = useDataStoreCreateBulk<AssetSyncQueueItem>(
    CollectionNames.AssetSyncQueue,
    { queryName: 'add-asset-sync-queue-items' }
  )
  const [isLoading, lastErrorCode, staticResults, hydrate] =
    useDatabaseQuery<AssetSyncQueueItem>(
      ViewNames.GetMyAssetSyncQueuedItems,
      [],
      {
        queryName: 'get-my-asset-sync-queued-items',
      }
    )
  const [isSubscribing, lastSubscribeErrorCode, liveResults] =
    useDataStoreItemsSync<AssetSyncQueueItem>(
      CollectionNames.AssetSyncQueue,
      staticResults ? staticResults.map((doc) => doc.id) : false,
      'get-my-asset-sync-queued-items_SYNCED'
    )

  const acceptRules = () => setShowRules(false)

  if (!user) {
    return <NoPermissionMessage />
  }

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

  const processItems = async () => {
    try {
      const records: AssetSyncQueueItemFields[] = []

      for (const url of newSourceUrls) {
        const cleanedUrl = url.trim()

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
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const results =
    liveResults && staticResults
      ? staticResults.map(
          (staticResult) => liveResults[staticResult.id] || staticResult
        )
      : staticResults

  if (lastErrorCode !== null || lastSubscribeErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load queued assets: {lastErrorCode || lastSubscribeErrorCode}
      </ErrorMessage>
    )
  }

  const isBusy = isCreating || isLoading || isSubscribing

  const validSourceUrls = newSourceUrls.filter(getCanSync)

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
            {isLoading || isSubscribing ? (
              <>
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
              </>
            ) : results ? (
              results.map((queuedItem, i) => {
                return (
                  <TableRow key={queuedItem.id}>
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
                      Queued: <QueuedStatus status={queuedItem.status} />
                    </TableCell>
                    <TableCell>
                      <DeleteButton queuedItem={queuedItem} isBusy={isBusy} />
                    </TableCell>
                  </TableRow>
                )
              })
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
          isDisabled={isBusy}>
          Add {validSourceUrls.length} Sources To Queue
        </Button>
      </FormControls>
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Upload a new asset to the site | VRCArena</title>
      <meta
        name="description"
        content="Complete the form, submit it for approval and your asset will be visible on the site."
      />
    </Helmet>
    <View />
  </>
)
