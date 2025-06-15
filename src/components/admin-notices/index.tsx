import React, { Fragment, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import EditIcon from '@mui/icons-material/Edit'

import { Notice, CollectionNames } from '../../modules/notices'
import Button from '../button'
import EditNoticeForm from '../edit-notice-form'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import NoticeRenderer from '../notice'
import Markdown from '../markdown'
import Heading from '../heading'
import Paper from '../paper'
import useDatabaseQuery, { OrderDirections } from '../../hooks/useDatabaseQuery'

export default () => {
  const [isLoading, lastErrorCode, notices, hydrate] = useDatabaseQuery<Notice>(
    CollectionNames.Notices,
    [],
    {
      orderBy: ['createdat', OrderDirections.DESC],
    }
  )
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)

  if (isLoading || !notices) {
    return <LoadingIndicator message="Loading notices..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load notices (code {lastErrorCode})</ErrorMessage>
    )
  }

  const onClickEdit = (notice: Notice) => setEditingNotice(notice)
  const clear = () => setEditingNotice(null)

  return (
    <>
      <Heading variant="h2">Create Notice</Heading>
      <Paper>
        <EditNoticeForm onSave={hydrate} onDone={clear} />
      </Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Message (Markdown)</TableCell>
            <TableCell>Visibility</TableCell>
            <TableCell>
              Order #
              <br />
              (lower number is shown first)
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notices.map((notice) => (
            <Fragment key={notice.id}>
              <TableRow>
                <TableCell>{notice.id}</TableCell>
                <TableCell>{notice.title}</TableCell>
                <TableCell>
                  <Markdown source={notice.message} />
                </TableCell>
                <TableCell>
                  {notice.isvisible ? 'Visible' : 'Not Visible'}
                </TableCell>
                <TableCell>{notice.orderby}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => onClickEdit(notice)}
                    icon={<EditIcon />}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
              {editingNotice && editingNotice.id === notice.id ? (
                <TableRow>
                  <TableCell colSpan={999}>
                    <Heading variant="h2">Edit Notice</Heading>
                    <EditNoticeForm
                      id={notice.id}
                      notice={notice}
                      onSave={hydrate}
                      onDone={clear}
                    />
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
