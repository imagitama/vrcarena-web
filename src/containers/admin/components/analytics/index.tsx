import styled from '@emotion/styled'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import useDatabaseQuery from '@/hooks/useDatabaseQuery'
import { AnalyticsEntryForAsset, ViewNames } from '@/modules/analytics'
import AssetResultsItem from '@/components/asset-results-item'

const Columns = styled.div`
  display: flex;
`
const Column = styled.div`
  padding: 0.5rem;
  &:first-child {
    min-width: 100px;
  }
`
const Title = styled.span``

const Analytics = () => {
  const [isLoading, lastErrorCode, entries] =
    useDatabaseQuery<AnalyticsEntryForAsset>(ViewNames.GetTopAssetAnalytics, [])

  if (isLoading) return <LoadingIndicator message="Loading analytics..." />
  if (lastErrorCode !== null)
    return (
      <ErrorMessage>
        Failed to load analytics (code {lastErrorCode})
      </ErrorMessage>
    )
  if (!entries) return <LoadingIndicator message="Waiting" />

  console.debug('ENTRIES', entries)

  return (
    <>
      {entries.map((entry, idx) => (
        <Columns key={entry.asset.id}>
          <Column>
            <Title
              style={{ fontSize: `${100 + 50 * (entries.length - idx)}%` }}>
              #{idx + 1}
            </Title>
          </Column>
          <Column>
            <AssetResultsItem asset={entry.asset} />
          </Column>
          <Column>
            <Table>
              <TableBody>
                {Object.entries(entry.url_counts).map(([url, total]) => (
                  <TableRow key={url}>
                    <TableCell>{url}</TableCell>
                    <TableCell>{total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Column>
        </Columns>
      ))}
    </>
  )
}

export default Analytics
