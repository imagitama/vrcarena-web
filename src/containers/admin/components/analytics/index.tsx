import styled from '@emotion/styled'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import { AnalyticsEntryForAsset, ViewNames } from '@/modules/analytics'
import AssetResultsItem from '@/components/asset-results-item'
import PaginatedView from '@/components/paginated-view'

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

const Renderer = ({ items }: { items?: AnalyticsEntryForAsset[] }) => {
  return (
    <>
      {items?.map((entry, idx) => (
        <Columns key={entry.asset.id}>
          <Column>
            <Title style={{ fontSize: `${100 + 50 * (items.length - idx)}%` }}>
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

const Analytics = () => (
  <PaginatedView<AnalyticsEntryForAsset>
    viewName={ViewNames.GetTopAssetAnalytics}>
    <Renderer />
  </PaginatedView>
)

export default Analytics
