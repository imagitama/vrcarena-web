import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import PaginatedView from '@/components/paginated-view'
import {
  CollectionNames,
  EmailNotification,
  NotificationQueuedItem,
  WebNotification,
} from '@/modules/notificationqueue'
import { getShortId } from '@/utils/formatting'
import FailureInfoOutput from '@/components/failure-info-output'
import { useState } from 'react'
import Button from '@/components/button'
import Dialog from '@/components/dialog'
import { OrderDirections } from '@/hooks/useDatabaseQuery'
import NoValueLabel from '@/components/no-value-label'
import StatusText from '@/components/status-text'
import QueueStatusLabel from '@/components/queue-status-label'

const WebDetails = ({ webDetails }: { webDetails: WebNotification<any> }) => {
  return (
    <Table size="small">
      <TableBody>
        <TableRow>
          <TableCell>Message</TableCell>
          <TableCell>
            {webDetails.message || <NoValueLabel>-</NoValueLabel>}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

const EmailDetails = ({
  emailDetails,
}: {
  emailDetails: EmailNotification
}) => {
  const [showingHtml, setShowingHtml] = useState(false)
  const [showingText, setShowingText] = useState(false)
  return (
    <Table size="small">
      <TableBody>
        <TableRow>
          <TableCell>Subject</TableCell>
          <TableCell>{emailDetails.subject || '-'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Recipient</TableCell>
          <TableCell>
            {emailDetails.recipient ? (
              `${emailDetails.recipient.name || '-'} ${
                emailDetails.recipient.email || '-'
              }`
            ) : (
              <NoValueLabel>(use recipient email)</NoValueLabel>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>HTML</TableCell>
          <TableCell>
            <Button
              onClick={() => setShowingHtml(true)}
              size="small"
              color="secondary">
              Show
            </Button>
            {showingHtml && (
              <Dialog onClose={() => setShowingHtml(false)}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: emailDetails.html || '(no HTML)',
                  }}></div>
              </Dialog>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Text</TableCell>
          <TableCell>
            <Button
              onClick={() => setShowingText(true)}
              size="small"
              color="secondary">
              Show
            </Button>
            {showingText && (
              <Dialog onClose={() => setShowingText(false)}>
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      emailDetails.text?.replaceAll('\n', '<br />') ||
                      '(no text)',
                  }}
                />
              </Dialog>
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

const Renderer = ({ items }: { items?: NotificationQueuedItem<any>[] }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell></TableCell>
        <TableCell>Status</TableCell>
        <TableCell>Event</TableCell>
        <TableCell>Recipient</TableCell>
        <TableCell>Method</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items!.map((item) => (
        <TableRow key={item.id}>
          <TableCell>#{getShortId(item.id)}</TableCell>
          <TableCell>
            <QueueStatusLabel id={item.id} status={item.status} />
            {item.failureinfo && (
              <>
                <br />
                <FailureInfoOutput failureInfo={item.failureinfo} />
              </>
            )}
            {item.result && JSON.stringify(item.result, null, '  ')}
          </TableCell>
          <TableCell>{item.eventname}</TableCell>
          <TableCell>{item.recipient}</TableCell>
          <TableCell>
            {item.overridemethod && (
              <>
                Override method: {item.overridemethod}
                <br />
              </>
            )}
            {item.webdetails && <WebDetails webDetails={item.webdetails} />}
            {item.emaildetails && (
              <EmailDetails emailDetails={item.emaildetails} />
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

const AdminNotifications = () => {
  return (
    <PaginatedView<NotificationQueuedItem>
      collectionName={CollectionNames.NotificationQueue}
      defaultFieldName="createdat"
      defaultDirection={OrderDirections.DESC}>
      <Renderer />
    </PaginatedView>
  )
}

export default AdminNotifications
