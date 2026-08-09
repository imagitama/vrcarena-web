import React, { useState } from 'react'
import TableBody from '@mui/material/TableBody'
import { TableCell } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Helmet } from '@unhead/react/helmet'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'

import * as routes from '@/routes'
import {
  FullBacklogItem,
  BacklogItemType,
  ViewNames,
  CollectionNames,
  BacklogItem,
  BacklogItemMeta,
} from '@/modules/backlog'
import { capitalizeFirstLetter } from '@/utils/formatting'

import useQueryParam from '@/hooks/useQueryParam'

import PaginatedView from '@/components/paginated-view'
import FormattedDate from '@/components/formatted-date'
import UsernameLink from '@/components/username-link'
import Button from '@/components/button'
import Heading from '@/components/heading'
import BodyText from '@/components/body-text'
import WarningMessage from '@/components/warning-message'
import Form from './components/form'
import {
  CheckAssetExistsButton,
  CheckAuthorExistsButton,
} from './components/buttons'
import CopyButton from '@/components/copy-button'
import {
  ResponsiveTable,
  ResponsiveTableCell,
  ResponsiveTableHead,
  ResponsiveTableRow,
} from '@/components/responsive-table'
import ShortId from '@/components/short-id'
import useIsEditor from '@/hooks/useIsEditor'
import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import LoadingIndicator from '@/components/loading-indicator'
import SuccessMessage from '@/components/success-message'
import ErrorMessage from '@/components/error-message'
import { AccessStatus } from '@/modules/common'
import { HydrateFn } from '@/hooks/useDataStore'
import StatusText from '@/components/status-text'
import Tooltip from '@/components/tooltip'

const URL_QUERY_PARAM_NAME = 'url'

const DeleteButton = ({ id, onDone }: { id: string; onDone: () => void }) => {
  const [isSaving, isSuccess, lastErrorCode, save] =
    useDataStoreEdit<BacklogItemMeta>(CollectionNames.BacklogItemsMeta, id)
  const onClick = async () => {
    await save({
      accessstatus: AccessStatus.Deleted,
    })
    onDone()
  }
  return (
    <>
      {isSaving ? (
        <LoadingIndicator message="Deleting..." />
      ) : isSuccess ? (
        <SuccessMessage>Item deleted</SuccessMessage>
      ) : lastErrorCode !== null ? (
        <ErrorMessage>Failed (code {lastErrorCode})</ErrorMessage>
      ) : null}
      <Button
        onClick={onClick}
        icon={<DeleteIcon />}
        size="small"
        color="secondary">
        Delete (Editors Only)
      </Button>
    </>
  )
}

const Renderer = ({
  items,
  hydrate,
}: {
  items?: FullBacklogItem[]
  hydrate?: HydrateFn
}) => {
  const isEditor = useIsEditor()

  return (
    <ResponsiveTable sx={{ tableLayout: 'fixed', width: '100%' }}>
      <ResponsiveTableHead>
        <TableRow>
          <TableCell />
          <TableCell>Type</TableCell>
          <TableCell>URL</TableCell>
          <TableCell>Metadata</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      </ResponsiveTableHead>
      <TableBody>
        {items!.map((backlogItem) => {
          const {
            id,
            type,
            url,
            createdat,
            createdby,
            createdbyusername,
            createdbyavatarurl,
            accessstatus,
          } = backlogItem
          return (
            <ResponsiveTableRow key={id}>
              <ResponsiveTableCell>
                <ShortId>{id}</ShortId>
              </ResponsiveTableCell>
              <ResponsiveTableCell label="Type">
                {capitalizeFirstLetter(type)}
              </ResponsiveTableCell>
              <ResponsiveTableCell label="URL" mobileWidthPerc="100%">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration:
                      accessstatus === AccessStatus.Deleted
                        ? 'line-through'
                        : undefined,
                  }}>
                  {url}
                  <OpenInNewIcon />
                </a>
                <CopyButton text={url} size="small" />
              </ResponsiveTableCell>
              <ResponsiveTableCell label="Meta">
                Submitted <FormattedDate date={createdat} /> by{' '}
                <UsernameLink
                  id={createdby}
                  username={createdbyusername}
                  avatarUrl={createdbyavatarurl}
                />
              </ResponsiveTableCell>
              <ResponsiveTableCell label="Status">
                <StatusText
                  positivity={accessstatus === AccessStatus.Deleted ? -1 : 0}>
                  {accessstatus === AccessStatus.Deleted
                    ? 'Deleted'
                    : 'Pending'}{' '}
                  <Tooltip title="Note: Staff must manually delete backlog items (WIP)">
                    <InfoIcon />
                  </Tooltip>
                </StatusText>
                {type === BacklogItemType.Asset ? (
                  <CheckAssetExistsButton backlogItem={backlogItem} />
                ) : (
                  <CheckAuthorExistsButton backlogItem={backlogItem} />
                )}
              </ResponsiveTableCell>
              <ResponsiveTableCell label="Controls">
                <Button
                  title="Navigates to the asset sync queue prefilled with the URL"
                  url={
                    type === BacklogItemType.Asset
                      ? routes.createAssetWithUrlVar.replace(
                          ':url',
                          encodeURIComponent(url)
                        )
                      : routes.createAuthorWithUrlVar.replace(
                          ':url',
                          encodeURIComponent(url)
                        )
                  }
                  size="small"
                  color="secondary"
                  icon={<AddIcon />}>
                  Create
                </Button>{' '}
                {isEditor && <DeleteButton id={id} onDone={hydrate!} />}
              </ResponsiveTableCell>
            </ResponsiveTableRow>
          )
        })}
      </TableBody>
    </ResponsiveTable>
  )
}

enum SubView {
  Pending = 'pending',
  Completed = 'completed',
}

const View = () => {
  const urlFromQueryParam = useQueryParam(URL_QUERY_PARAM_NAME)
  const [isFormVisible, setIsFormVisible] = useState(urlFromQueryParam !== null)

  return (
    <>
      <PaginatedView<FullBacklogItem>
        viewName={ViewNames.GetFullBacklogItems}
        name="view-backlog"
        sortOptions={[
          {
            label: 'Logged at',
            fieldName: 'createdat',
          },
        ]}
        defaultFieldName={'createdat'}
        urlWithSubViewNameAndPageNumberVar={
          routes.backlogWithSubViewNameAndPageNumberVar
        }
        extraControls={[
          <Button onClick={() => setIsFormVisible(true)}>
            Add To Backlog
          </Button>,
        ]}
        defaultSubView={SubView.Pending}
        itemNamePlural="backlog items"
        form={
          isFormVisible
            ? ({ hydrate }) => (
                <Form
                  onDone={() => {
                    setIsFormVisible(false)
                    hydrate()
                  }}
                />
              )
            : undefined
        }>
        <Renderer />
      </PaginatedView>
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Backlog</title>
      <meta
        name="description"
        content="Browse the backlog of assets and authors that need to be created as assets on the site."
      />
    </Helmet>
    <Heading variant="h1">Backlog</Heading>
    <BodyText>
      We understand submitting assets is too much work and time consuming for
      some people. Instead you can <em>dump</em> any asset and author URLs you
      find for someone to add later.
    </BodyText>
    <WarningMessage hideId="backlog_begging">
      We strongly encourage you to submit assets yourself (anyone can do it!).
      It means less work for other people who monitor this backlog. We are all
      volunteers.
    </WarningMessage>
    <View />
  </>
)
