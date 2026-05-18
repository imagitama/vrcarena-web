import styled from '@emotion/styled'

import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'
import {
  FullAsset,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
import {
  AuditQueueItem,
  AuditResult,
  AuditResultResult,
  CollectionNames,
} from '@/modules/auditqueue'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import StatusText from '../status-text'
import { getPositivityForStatus, getStatusPastTense } from '../ai-result'
import Button from '../button'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'
import SuccessMessage from '../success-message'
import { useState } from 'react'
import ButtonDropdown, { DropdownOption } from '../button-dropdown'
import FormattedDate from '../formatted-date'

const getLabelForStatus = (status: AuditResultResult): string => {
  switch (status) {
    case AuditResultResult.Failed:
      return 'Failed'
    case AuditResultResult.Missing:
      return 'Missing'
    case AuditResultResult.Success:
      return 'Success'
    case AuditResultResult.Unavailable:
      return 'Unavailable'
    default:
      return 'Unknown'
  }
}

const AuditedAsset = ({ result }: { result: AuditResult }) => {
  return (
    <>
      <strong>{result.sourceurl}</strong>
      <br />
      {result.actualurl ? (
        <>
          {'=>'} {result.actualurl}
          <br />
        </>
      ) : null}
      Status: {getLabelForStatus(result.result)}
      <br />
      Price: {result.price}
      <br />
      Currency: {result.pricecurrency}
      <br />
    </>
  )
}

const Item = styled.div`
  width: 100%;
  padding: 0.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  &:first-child {
    padding-top: 0;
    border-top: none;
  }
  &:last-child {
    padding-bottom: 0;
  }
`

export const Renderer = ({ queuedItem }: { queuedItem: AuditQueueItem }) => (
  <Item key={queuedItem.id}>
    <StatusText positivity={getPositivityForStatus(queuedItem.status)}>
      {getStatusPastTense(queuedItem.status)}
    </StatusText>
    <br />
    <small>
      <FormattedDate date={queuedItem.createdat} />
    </small>
    <br />
    {queuedItem.result !== null && <AuditedAsset result={queuedItem.result} />}
  </Item>
)

const AssetAuditResult = ({ asset }: { asset: FullAsset }) => {
  const [isLoading, lastErrorCode, results, hydrate] =
    useDatabaseQuery<AuditQueueItem>(
      CollectionNames.AuditQueue,
      [
        ['parenttable', Operators.EQUALS, AssetsCollectionNames.Assets],
        ['parent', Operators.EQUALS, asset.id],
      ],
      {
        queryName: `asset-audit-result_${asset.id}`,
        orderBy: ['createdat', OrderDirections.DESC],
        limit: 2,
      }
    )
  const [isCreating, isSuccess, lastErrorCodeCreating, create] =
    useDataStoreCreate<AuditQueueItem>(CollectionNames.AuditQueue)
  const [selectedSourceUrl, setSelectedSourceUrl] = useState(asset.sourceurl)

  if (isLoading) {
    return <LoadingIndicator message="Loading queue for asset..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to get queue for asset (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (lastErrorCodeCreating !== null) {
    return (
      <ErrorMessage>
        Failed to re-queue (code {lastErrorCodeCreating})
      </ErrorMessage>
    )
  }

  const onRequeue = async () => {
    if (!selectedSourceUrl) {
      throw new Error('Need a URL')
    }
    await create({
      url: selectedSourceUrl,
      parenttable: AssetsCollectionNames.Assets,
      parent: asset.id,
    })
  }

  const options: DropdownOption[] = [asset.sourceurl]
    .concat(asset.extrasources.map((item) => item.url))
    .map((url) => ({
      id: url,
      label: url,
    }))

  return (
    <div>
      <strong style={{ marginBottom: '0.5rem' }}>
        Most recent 2 asset audits:
      </strong>
      {results === null || results.length === 0 ? (
        <NoResultsMessage>Nothing in the queue</NoResultsMessage>
      ) : (
        results.map((queuedItem) => {
          return <Renderer key={queuedItem.id} queuedItem={queuedItem} />
        })
      )}
      {isSuccess && <SuccessMessage>Added to queue</SuccessMessage>}
      {isCreating && <LoadingIndicator message="Adding to queue..." />}
      <Button onClick={hydrate} size="small" hollow>
        Refresh
      </Button>{' '}
      <ButtonDropdown
        options={options}
        onSelect={(url) => setSelectedSourceUrl(url)}
        label="Source URL"
        size="small"
        color="secondary"
        hollow>
        <Button onClick={onRequeue} size="small" hollow>
          Re-Queue
        </Button>
      </ButtonDropdown>
    </div>
  )
}

export default AssetAuditResult
