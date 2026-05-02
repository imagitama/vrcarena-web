import React from 'react'
import InfoIcon from '@mui/icons-material/Info'

import useDataStoreItem from '@/hooks/useDataStoreItem'
import { CollectionNames, SpecialEntry } from '@/modules/special'

import ErrorMessage from '@/components/error-message'
import StatusText from '@/components/status-text'
import Tooltip from '@/components/tooltip'
import FormattedDate from '@/components/formatted-date'

enum PlatformSyncStatus {
  Success,
  Failed,
}

interface PlatformSyncAssertionResult {
  productUrl: string
  status: PlatformSyncStatus
  notes: string | null
}

interface PlatformSyncAssertionResults {
  [platformName: string]: PlatformSyncAssertionResult
}

type PlatformSyncAssertionRecord = SpecialEntry<PlatformSyncAssertionResults>

const RECORD_ID = 'sync_status'

const getPositivity = (result: PlatformSyncAssertionResults): number => {
  const values = Object.values(result)

  if (values.length < 1)
    throw new Error('Cannot get positivity without some values')

  const failedPlatformCount = values.reduce(
    (failedCount, result) =>
      result.status === PlatformSyncStatus.Failed
        ? failedCount + 1
        : failedCount,
    0
  )

  return failedPlatformCount === values.length
    ? -1
    : failedPlatformCount > 0
    ? 0
    : 1
}

const getLabel = (result: PlatformSyncAssertionResults): string => {
  const values = Object.values(result)

  if (values.length < 1) throw new Error('Cannot get label without some values')

  const failedPlatformCount = values.reduce(
    (failedCount, result) =>
      result.status === PlatformSyncStatus.Failed
        ? failedCount + 1
        : failedCount,
    0
  )

  return failedPlatformCount === values.length
    ? 'Sync unavailable'
    : failedPlatformCount > 0
    ? 'Some sync platforms unavailable'
    : 'Sync should work'
}

const PlatformSyncAssertion = () => {
  const [isLoading, lastErrorCode, lastResult] =
    useDataStoreItem<PlatformSyncAssertionRecord>(
      CollectionNames.Special,
      RECORD_ID
    )

  if (lastErrorCode !== null)
    return <ErrorMessage>Failed (code {lastErrorCode})</ErrorMessage>

  if (isLoading) return <>...</>

  if (!lastResult || !lastResult.value)
    return <ErrorMessage>No result</ErrorMessage>

  const { value } = lastResult

  return (
    <StatusText positivity={getPositivity(value)}>
      {getLabel(value)}{' '}
      <Tooltip
        title={
          <>
            The site automatically checks if all platforms are syncable every 24
            hours
            <br />
            <br />
            Last checked{' '}
            {lastResult.lastmodifiedat ? (
              <FormattedDate date={lastResult.lastmodifiedat} />
            ) : (
              '(never)'
            )}
            <ul>
              {Object.entries(value).map(([platformName, result]) => (
                <li key={platformName}>
                  {platformName}{' '}
                  {result.status === PlatformSyncStatus.Success
                    ? 'Success'
                    : result.status === PlatformSyncStatus.Failed
                    ? 'Failed'
                    : result.status}
                </li>
              ))}
            </ul>
          </>
        }>
        <InfoIcon />
      </Tooltip>
    </StatusText>
  )
}

export default PlatformSyncAssertion
