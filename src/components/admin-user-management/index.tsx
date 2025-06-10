import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

import useDatabaseQuery from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Link from '../../components/link'

import * as routes from '../../routes'
import { CollectionNames, User } from '../../modules/users'

const AdminUserManagement = () => {
  const [isLoading, lastErrorCode, users] = useDatabaseQuery<User>(
    CollectionNames.Users,
    []
  )

  if (isLoading || !Array.isArray(users)) {
    return <LoadingIndicator message="Loading users..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load users (code {lastErrorCode})</ErrorMessage>
    )
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
