import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import ErrorMessage from '@/components/error-message'
import Heading from '@/components/heading'
import LoadingIndicator from '@/components/loading-indicator'
import useDatabaseQuery from '@/hooks/useDatabaseQuery'
import { AssetCategory } from '@/modules/assets'
import styled from '@emotion/styled'
import { Helmet } from '@unhead/react/helmet'
import categoryMetas from '@/category-meta'
import ErrorBoundary from '@/components/error-boundary'
import Tooltip from '@/components/tooltip'
import { FullStats, ViewNames } from '@/modules/stats'

const Tiles = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const StyledTile = styled.div`
  width: calc(33.3% - 1rem);
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin: 0.5rem;
  background: rgba(0, 0, 0, 0.1);
`
const Tile = ({
  title,
  children,
}: {
  title: string
  children: React.ReactElement
}) => (
  <StyledTile>
    <Heading variant="h2">{title}</Heading>
    <ErrorBoundary>{children}</ErrorBoundary>
  </StyledTile>
)

const Content = () => {
  const [isLoading, lastErrorCode, statResults] = useDatabaseQuery<FullStats>(
    ViewNames.GetFullStats,
    []
  )

  if (isLoading) return <LoadingIndicator message="Loading stats..." />

  if (lastErrorCode !== null)
    return (
      <ErrorMessage>Failed to load stats (code {lastErrorCode})</ErrorMessage>
    )

  if (!statResults || !statResults.length)
    return <ErrorMessage>Stats empty</ErrorMessage>

  const stats = statResults[0]

  return (
    <Tiles>
      <Tile title="Assets">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>
                <Tooltip title="Only: Public">
                  <span>Total Assets</span>
                </Tooltip>
              </TableCell>
              <TableCell>{stats.assets.assetcount}</TableCell>
            </TableRow>
            {Object.values(AssetCategory).map((category) => (
              <TableRow key={category}>
                <TableCell>
                  &nbsp;&nbsp;{categoryMetas[category].name}
                </TableCell>
                <TableCell>{stats.assets.categorycount[category]}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <Tooltip title="Approved in last 30 days">
                  <span>Per Day</span>
                </Tooltip>
              </TableCell>
              <TableCell>{stats.assets.assetsperday}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Tooltip title="Approved in last 30 days">
                  <span>Per Week</span>
                </Tooltip>
              </TableCell>
              <TableCell>{stats.assets.assetsperweek}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Tile>
      <Tile title="Authors">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Total Authors</TableCell>
              <TableCell>{stats.authors.authorcount}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Tile>
      <Tile title="Amendments">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>
                <Tooltip title="Only: Applied">
                  <span>Total Amendments</span>
                </Tooltip>
              </TableCell>
              <TableCell>{stats.amendments.amendmentcount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Tooltip title="Applied in last 30 days">
                  <span>Per Day</span>
                </Tooltip>
              </TableCell>
              <TableCell>{stats.amendments.amendmentsperday}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Tooltip title="Applied in last 30 days">
                  <span>Per Week</span>
                </Tooltip>
              </TableCell>
              <TableCell>{stats.amendments.amendmentsperweek}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Tile>
      <Tile title="Users">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>
                <Tooltip title="Only: Unbanned with username set">
                  <span>Total Users</span>
                </Tooltip>
              </TableCell>
              <TableCell>{stats.users.usercount}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Tile>
      <Tile title="Species">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Total Species</TableCell>
              <TableCell>{stats.species.speciescount}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Tile>
      <Tile title="Patreon">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Total Active Patrons</TableCell>
              <TableCell>{stats.patreon.activepatroncount}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Tile>
    </Tiles>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Website Stats</title>
      <meta name="description" content="Stats about the site." />
    </Helmet>
    <Heading variant="h1">Stats</Heading>
    <Content />
  </>
)
