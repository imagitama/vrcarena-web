import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Link from '../../components/link'

import * as routes from '../../routes'
import { User } from '../../modules/users'

const AdminUserManagement = () => {
  const [isLoading, isErrored, users] = useDatabaseQuery<User>(
    CollectionNames.Users,
    []
  )

  if (isLoading || !Array.isArray(users)) {
    return <LoadingIndicator message="Loading users..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load users. Please try again</ErrorMessage>
  }

  if (!users.length) {
    return <>Found no users</>
  }

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User ID</TableCell>
            <TableCell>Username</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(({ id, username }) => (
            <TableRow key={id}>
              <TableCell>{id}</TableCell>
              <TableCell>
                <Link to={routes.viewUserWithVar.replace(':userId', id)}>
                  {username}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default AdminUserManagement
