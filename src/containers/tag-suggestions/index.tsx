import React from 'react'
import TableBody from '@mui/material/TableBody'
import { TableCell } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'
import {
  ViewNames,
  FullTagSuggestion,
  CollectionNames,
} from '@/modules/tagsuggestions'
import { capitalizeFirstLetter, getShortId } from '@/utils/formatting'

import PaginatedView from '@/components/paginated-view'
import FormattedDate from '@/components/formatted-date'
import UsernameLink from '@/components/username-link'
import Heading from '@/components/heading'
import BodyText from '@/components/body-text'
import {
  ResponsiveTable,
  ResponsiveTableCell,
  ResponsiveTableHead,
  ResponsiveTableRow,
} from '@/components/responsive-table'
import ShortId from '@/components/short-id'
import useIsEditor from '@/hooks/useIsEditor'
import { AccessStatus, ResolutionStatus } from '@/modules/common'
import { HydrateFn } from '@/hooks/useDataStore'
import StatusText from '@/components/status-text'
import EditorRecordManager from '@/components/editor-record-manager'
import NoValueLabel from '@/components/no-value-label'
import Link from '@/components/link'

const Renderer = ({
  items,
  hydrate,
}: {
  items?: FullTagSuggestion[]
  hydrate?: HydrateFn
}) => {
  const isEditor = useIsEditor()

  return (
    <ResponsiveTable sx={{ tableLayout: 'fixed', width: '100%' }}>
      <ResponsiveTableHead>
        <TableRow>
          <TableCell />
          <TableCell>Tag 1</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Tag 2</TableCell>
          <TableCell>Metadata</TableCell>
          <TableCell>Status</TableCell>
          {isEditor && <TableCell>Controls</TableCell>}
        </TableRow>
      </ResponsiveTableHead>
      <TableBody>
        {items!.map((item) => {
          const {
            id,
            targettag: targetTag,
            type,
            relatedtag: relatedTag,
            createdat,
            createdby,
            createdbyusername,
            createdbyavatarurl,
            accessstatus: accessStatus,
            resolutionstatus: resolutionStatus,
          } = item
          return (
            <ResponsiveTableRow key={id}>
              <ResponsiveTableCell>
                <Link
                  to={routes.viewTagSuggestionWithVar.replace(
                    ':tagSuggestionId',
                    id
                  )}>
                  #{getShortId(id)}
                </Link>
              </ResponsiveTableCell>
              <ResponsiveTableCell label="Tag">
                {targetTag || '-'}
              </ResponsiveTableCell>
              <ResponsiveTableCell label="Type">
                {capitalizeFirstLetter(type)}
              </ResponsiveTableCell>
              <ResponsiveTableCell label="Related Tag">
                {relatedTag || '-'}
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
                  positivity={accessStatus === AccessStatus.Deleted ? -1 : 0}>
                  {accessStatus === AccessStatus.Deleted
                    ? 'Deleted'
                    : 'Not Deleted'}
                </StatusText>
                <br />
                <StatusText
                  positivity={
                    resolutionStatus === ResolutionStatus.Resolved ? 1 : 0
                  }>
                  {resolutionStatus === ResolutionStatus.Resolved
                    ? 'Resolved'
                    : 'Not Resolved'}
                </StatusText>
              </ResponsiveTableCell>
              {isEditor && (
                <ResponsiveTableCell label="Controls">
                  <EditorRecordManager
                    id={id}
                    metaCollectionName={CollectionNames.TagSuggestionsMeta}
                    showAccessButtons
                    onDone={hydrate}
                  />
                </ResponsiveTableCell>
              )}
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
  // const urlFromQueryParam = useQueryParam(URL_QUERY_PARAM_NAME)
  // const [isFormVisible, setIsFormVisible] = useState(urlFromQueryParam !== null)

  return (
    <>
      <PaginatedView<FullTagSuggestion>
        viewName={ViewNames.GetFullTagSuggestions}
        name="tag-suggestions"
        sortOptions={[
          {
            label: 'Created at',
            fieldName: 'createdat',
          },
        ]}
        defaultFieldName={'createdat'}
        urlWithSubViewNameAndPageNumberVar={
          routes.tagSuggestionsWithPageNumberVar
        }
        createUrl={routes.createTagSuggestion}
        // extraControls={[
        //   <Button onClick={() => setIsFormVisible(true)}>
        //     Add To Backlog
        //   </Button>,
        // ]}
        // defaultSubView={SubView.Pending}
        itemNamePlural="tag suggestions"
        // form={
        //   isFormVisible
        //     ? ({ hydrate }) => (
        //         <Form
        //           onDone={() => {
        //             setIsFormVisible(false)
        //             hydrate()
        //           }}
        //         />
        //       )
        //     : undefined
      >
        <Renderer />
      </PaginatedView>
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Tag Suggestions</title>
      <meta
        name="description"
        content="Browse the suggestions for changes to our tags."
      />
    </Helmet>
    <Heading variant="h1">Tag Suggestions</Heading>
    <BodyText>Browse the suggestions for changes to our tags.</BodyText>
    <View />
  </>
)
