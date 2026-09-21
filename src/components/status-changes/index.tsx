import {
  StatusChange,
  StatusChanges as StatusChangesType,
} from '@/modules/common'

import Table from '@/components/responsive-table'
import { TableBody } from '@/components/responsive-table'
import { TableCell } from '@/components/responsive-table'
import { TableHead } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'
import { capitalize } from '@/utils'
import UsernameLink from '../username-link'
import FormattedDate from '../formatted-date'

const StatusChanges = ({
  statusChanges,
}: {
  statusChanges: StatusChangesType
}) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Col</TableCell>
        <TableCell>Value</TableCell>
        <TableCell>Who</TableCell>
        <TableCell>When</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {Object.entries(statusChanges).map(
        ([colName, change]: [string, StatusChange]) => (
          <TableRow key={colName}>
            <TableCell>{capitalize(colName.replace('status', ''))}</TableCell>
            <TableCell>{change.value}</TableCell>
            <TableCell>
              {change && change.userid ? (
                <UsernameLink
                  id={change.userid}
                  username={change.username!}
                  avatarUrl={change.avatarurl!}
                />
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell>
              {change.createdat ? (
                <FormattedDate date={change.createdat} />
              ) : (
                '-'
              )}
            </TableCell>
          </TableRow>
        )
      )}
    </TableBody>
  </Table>
)

export default StatusChanges
