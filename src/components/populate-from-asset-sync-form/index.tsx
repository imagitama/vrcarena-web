import { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import SyncIcon from '@mui/icons-material/Sync'

import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'

import { Asset } from '@/modules/assets'
import {
  CollectionNames as AssetSyncQueueCollectionNames,
  AssetSyncQueueItem,
  Intent,
} from '@/modules/assetsyncqueue'
import assetEditableFields from '@/editable-fields/assets'
import categoryMetas from '@/category-meta'
import { getSyncPlatformLabelFromUrl } from '@/syncing'

import ErrorMessage from '@/components/error-message'
import FormControls from '@/components/form-controls'
import Button from '@/components/button'
import CheckboxInput from '@/components/checkbox-input'
import FieldOutput from '@/components/field-output'
import NoResultsMessage from '@/components/no-results-message'
import LoadingIndicator from '@/components/loading-indicator'
import SuccessMessage from '@/components/success-message'
import Heading from '@/components/heading'
import FormattedDate from '@/components/formatted-date'
import FailureInfoOutput from '@/components/failure-info-output'
import {
  ConnectionStatus,
  getConnectionStatusFromHookResult,
} from '../connection-indicator'
import AiResultSummary from '../ai-result-summary'
import useDataStoreItemSync from '@/hooks/useDataStoreItemSync'

interface Props {
  assetFields: Partial<Asset>
  onDone: (fields: Partial<Asset>) => void
}

const PopulateFromAssetSyncForm = (props: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const onDone = (fields: Partial<Asset>) => {
    setIsExpanded(false)
    props.onDone(fields)
  }

  return (
    <>
      <Heading variant="h2" noTopMargin>
        Populate From{' '}
        {props.assetFields.sourceurl
          ? getSyncPlatformLabelFromUrl(props.assetFields.sourceurl)
          : 'Platform'}
      </Heading>
      {isExpanded ? (
        <Form {...props} onDone={onDone} />
      ) : (
        <FormControls>
          <Button
            onClick={() => setIsExpanded(true)}
            icon={<SyncIcon />}
            color="secondary"
            hollow={false}>
            Show Sync Form
          </Button>
        </FormControls>
      )}
    </>
  )
}

const QueuedItem = ({
  queuedItem,
  connectionStatus,
  onRefresh,
}: {
  queuedItem: AssetSyncQueueItem
  connectionStatus: ConnectionStatus
  onRefresh: () => void
}) => (
  <>
    <AiResultSummary
      queuedItem={queuedItem}
      connectionStatus={connectionStatus}
    />
    <Button color="secondary" onClick={onRefresh} size="small" hollow>
      Refresh
    </Button>
  </>
)

const Form = ({ assetFields, onDone }: Props) => {
  const [isLoading, lastErrorCode, queuedItems, hydrate] =
    useDatabaseQuery<AssetSyncQueueItem>(
      AssetSyncQueueCollectionNames.AssetSyncQueue,
      assetFields.sourceurl
        ? [['sourceurl', Operators.EQUALS, assetFields.sourceurl]]
        : false,
      {
        queryName: 'populate_assetsyncqueue',
        limit: 1,
        orderBy: ['createdat', OrderDirections.DESC],
      }
    )

  const [isCreating, isSuccess, lastErrorCodeSaving, create] =
    useDataStoreCreate<AssetSyncQueueItem>(
      AssetSyncQueueCollectionNames.AssetSyncQueue,
      {
        queryName: 'create_assetsyncqueue',
      }
    )
  const [newFields, setNewFields] = useState<Partial<Asset>>({})

  const onClickDone = () => {
    onDone(newFields)
  }

  const lastQueuedItemStale: null | AssetSyncQueueItem =
    Array.isArray(queuedItems) && queuedItems.length ? queuedItems[0] : null

  const [isSubscribing, isSubscribed, lastErrorCodeSync, lastQueuedItemLive] =
    useDataStoreItemSync<AssetSyncQueueItem>(
      AssetSyncQueueCollectionNames.AssetSyncQueue,
      lastQueuedItemStale ? lastQueuedItemStale.id : false,
      {
        queryName: `populate_assetsyncqueue_${
          lastQueuedItemStale ? lastQueuedItemStale.id : 'false'
        }_sync`,
      }
    )

  const lastQueuedItem: AssetSyncQueueItem | null =
    lastQueuedItemLive || lastQueuedItemStale

  const hasNothing =
    !isLoading && Array.isArray(queuedItems) && queuedItems.length === 0

  const canUseFields =
    lastQueuedItemStale !== null && lastQueuedItemStale.result !== null

  const toggleField = (fieldName: string, fieldValue: any) =>
    setNewFields((currentFields) => {
      if (fieldName in currentFields) {
        const fields = { ...currentFields }
        delete fields[fieldName]
        return fields
      } else {
        return {
          ...currentFields,
          [fieldName]: fieldValue,
        }
      }
    })

  const onClickSync = async () => {
    if (!assetFields.sourceurl) throw new Error('Need source URL')
    await create({
      sourceurl: assetFields.sourceurl,
      intent: Intent.EditAsset,
    })
    hydrate()
  }

  const onClickRetry = () => onClickSync()

  const getDisplayValue = (
    fieldName: keyof Asset,
    fieldValue: any
  ): string | null => {
    switch (fieldName) {
      case 'author':
        const fieldsData = lastQueuedItem?.result?.fieldsData || null
        return fieldsData?.authorName || null
      case 'category':
        return fieldValue in categoryMetas
          ? categoryMetas[fieldValue].nameSingular
          : null
      default:
        return null
    }
  }

  return (
    <>
      {lastQueuedItem ? (
        <QueuedItem
          queuedItem={lastQueuedItem}
          connectionStatus={getConnectionStatusFromHookResult(
            isSubscribing,
            isSubscribed,
            lastErrorCodeSync
          )}
          onRefresh={hydrate}
        />
      ) : null}
      {lastErrorCode !== null && (
        <ErrorMessage>Failed to get sync (code {lastErrorCode})</ErrorMessage>
      )}
      {isCreating && <LoadingIndicator message="Queueing..." />}
      {lastErrorCodeSaving !== null && (
        <ErrorMessage>
          Failed to queue (code {lastErrorCodeSaving})
        </ErrorMessage>
      )}
      {isSuccess && (
        <SuccessMessage>
          Added to queue (should take a few seconds)
        </SuccessMessage>
      )}
      {hasNothing && (
        <FormControls>
          <Button onClick={onClickSync} icon={<SyncIcon />}>
            Request Sync
          </Button>
        </FormControls>
      )}
      {lastQueuedItem !== null && (
        <Table size="small">
          <TableBody>
            {lastQueuedItem.result !== null ? (
              Object.entries(lastQueuedItem.result.fields).map(
                ([fieldName, fieldValue]) => {
                  const editableField = assetEditableFields.find(
                    (field) => field.name === fieldName
                  )
                  if (!editableField)
                    throw new Error(
                      `No editable field with name "${fieldName}"`
                    )

                  const displayValue = getDisplayValue(fieldName, fieldValue)

                  return (
                    <TableRow key={fieldName}>
                      <TableCell>{editableField.label}</TableCell>
                      <TableCell>
                        <FieldOutput editableField={editableField}>
                          {displayValue || fieldValue}
                        </FieldOutput>
                      </TableCell>
                      <TableCell>
                        <CheckboxInput
                          onClick={() => toggleField(fieldName, fieldValue)}
                          value={fieldName in newFields}
                        />
                      </TableCell>
                    </TableRow>
                  )
                }
              )
            ) : (
              <TableRow>
                <TableCell colSpan={999}>
                  <NoResultsMessage>No fields found</NoResultsMessage>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      <FormControls>
        <Button
          color="primary"
          onClick={onClickDone}
          isDisabled={!canUseFields}>
          Use These Fields
        </Button>
        <Button
          color="secondary"
          onClick={onClickRetry}
          isDisabled={hasNothing}>
          Retry
        </Button>
      </FormControls>
    </>
  )
}

export default PopulateFromAssetSyncForm
