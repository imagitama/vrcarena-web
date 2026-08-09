import React, { Fragment, useState } from 'react'
import Table from '@/components/responsive-table'
import TableBody from '@mui/material/TableBody'
import { TableCell } from '@/components/responsive-table'
import { TableHead } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'
import EditIcon from '@mui/icons-material/Edit'

import { Notice, CollectionNames } from '@/modules/notices'
import useDatabaseQuery, { OrderDirections } from '@/hooks/useDatabaseQuery'

import Button from '@/components/button'
import EditNoticeForm from '@/components/edit-notice-form'
import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import Heading from '@/components/heading'
import Paper from '@/components/paper'
import StatusText from '../status-text'
import ShortId from '../short-id'

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
            <TableCell></TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Visibility</TableCell>
            <TableCell>Order #</TableCell>
            <TableCell>Controls</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notices.map((notice) => (
            <Fragment key={notice.id}>
              <TableRow>
                <TableCell title={notice.id}>
                  <ShortId>{notice.id}</ShortId>
                </TableCell>
                <TableCell label="Title">{notice.title}</TableCell>
                <TableCell label="Message">
                  {notice.message.slice(0, 50)}...
                </TableCell>
                <TableCell label="Visibility">
                  <StatusText positivity={notice.isvisible ? 1 : 0}>
                    {notice.isvisible ? 'Visible' : 'Not Visible'}
                  </StatusText>
                </TableCell>
                <TableCell label="Order #" title="Lower number is shown first">
                  {notice.orderby}
                </TableCell>
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
