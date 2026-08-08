import React, { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Helmet } from '@unhead/react/helmet'
import AddIcon from '@mui/icons-material/Add'

import * as routes from '@/routes'
import { FullBacklogItem, BacklogItemType, ViewNames } from '@/modules/backlog'
import { capitalizeFirstLetter, getShortId } from '@/utils/formatting'

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

const URL_QUERY_PARAM_NAME = 'url'

const Renderer = ({ items }: { items?: FullBacklogItem[] }) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell />
        <TableCell>Type</TableCell>
        <TableCell>URL</TableCell>
        <TableCell>Submitted</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableHead>
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
        } = backlogItem
        return (
          <TableRow key={id}>
            <TableCell>#{getShortId(id)}</TableCell>
            <TableCell>{capitalizeFirstLetter(type)}</TableCell>
            <TableCell>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
                <OpenInNewIcon />
              </a>
            </TableCell>
            <TableCell>
              <FormattedDate date={createdat} /> by{' '}
              <UsernameLink
                id={createdby}
                username={createdbyusername}
                avatarUrl={createdbyavatarurl}
              />
            </TableCell>
            <TableCell>
              {type === BacklogItemType.Asset ? (
                <CheckAssetExistsButton backlogItem={backlogItem} />
              ) : (
                <CheckAuthorExistsButton backlogItem={backlogItem} />
              )}{' '}
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
              </Button>
            </TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  </Table>
)

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
