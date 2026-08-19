import React from 'react'
import Table from '@/components/responsive-table'
import TableBody from '@mui/material/TableBody'
import { TableCell } from '@/components/responsive-table'
import { TableHead } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'
import EditIcon from '@mui/icons-material/Edit'

import * as routes from '@/routes'
import {
  CollectionNames,
  FullRepChange,
  RepReason,
  ViewNames,
} from '@/modules/reputation'

import PaginatedView from '@/components/paginated-view'
import { FilterSubType, FilterType } from '@/filters'
import RepChangeList from '@/components/rep-change-list'
import Tabs from '@/components/tabs'
import NoResultsMessage from '@/components/no-results-message'
import FormattedDate from '@/components/formatted-date'
import StatusText from '@/components/status-text'
import InfoMessage from '@/components/info-message'
import Heading from '@/components/heading'
import DialogButton from '@/components/dialog-button'
import GenericEditor from '@/components/generic-editor'
import editableFields from '@/editable-fields/rep-reasons'
import Icon from '@/components/icon'
import NoValueLabel from '@/components/no-value-label'

const RendererChanges = ({ items }: { items?: FullRepChange[] }) => (
  <RepChangeList repChanges={items!} />
)

const RepReasonRow = ({ repReason }: { repReason: RepReason }) => {
  return (
    <TableRow key={repReason.name}>
      <TableCell label="Name" title={repReason.name}>
        {repReason.name}
      </TableCell>
      <TableCell label="Delta">
        <StatusText positivity={repReason.delta > 0 ? 1 : -1}>
          {repReason.delta}
        </StatusText>
      </TableCell>
      <TableCell label="Desc">{repReason.description}</TableCell>
      <TableCell label="Icon">
        {repReason.icon ? <Icon name={repReason.icon} /> : '-'}
      </TableCell>
      <TableCell label="Milestone">
        {repReason.milestonelabel === null ? (
          <NoValueLabel>No</NoValueLabel>
        ) : (
          repReason.milestonelabel
        )}
      </TableCell>
      <TableCell label="Metadata">
        <FormattedDate date={repReason.createdat} />
        {repReason.createdby ? (
          <> by {repReason.createdby.substring(0, 5)}...</>
        ) : null}
      </TableCell>
      <TableCell label="Controls">
        <DialogButton
          dialog={
            <>
              <Heading variant="h1">Edit Rep</Heading>
              <GenericEditor
                collectionName={CollectionNames.RepReasons}
                id={repReason.name}
                fields={editableFields}
                idField="name"
              />
            </>
          }
          icon={<EditIcon />}
          size="small"
          color="secondary">
          Edit
        </DialogButton>
      </TableCell>
    </TableRow>
  )
}

const RendererReasons = ({ items }: { items?: RepReason[] }) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell width="25%">Name</TableCell>
        <TableCell>Delta</TableCell>
        <TableCell>Desc</TableCell>
        <TableCell>Icon</TableCell>
        <TableCell>Milestone</TableCell>
        <TableCell>Metadata</TableCell>
        <TableCell>Controls</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items!.length ? (
        items!.map((repReason) => (
          <RepReasonRow repReason={repReason} key={repReason.name} />
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={5}>
            <NoResultsMessage>No reasons found</NoResultsMessage>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
)

export default () => {
  return (
    <>
      <Heading variant="h1">Reputation</Heading>
      <InfoMessage title="How Reputation Works" hideId="admin-rep-info">
        Users gain reputation from performing actions on the site: creating
        assets, amendments, comments, having an old account, etc.
      </InfoMessage>
      <Tabs
        horizontal
        items={[
          {
            name: 'list',
            label: 'Changes',
            contents: (
              <PaginatedView<FullRepChange>
                viewName={ViewNames.GetFullRepChanges}
                name="view-rep-changes"
                sortOptions={[
                  {
                    label: 'Created at',
                    fieldName: 'createdat',
                  },
                ]}
                defaultFieldName={'createdat'}
                urlWithSubViewNameAndPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
                  ':tabName',
                  'reputation'
                )}
                filters={[
                  {
                    fieldName: 'reason',
                    label: 'Reason',
                    type: FilterType.Equal,
                  },
                  {
                    fieldName: 'createdby',
                    label: 'Created By',
                    type: FilterType.Equal,
                    subType: FilterSubType.UserId,
                  },
                ]}>
                <RendererChanges />
              </PaginatedView>
            ),
          },
          {
            name: 'editor',
            label: 'Reasons',
            contents: (
              <PaginatedView<RepReason>
                viewName={CollectionNames.RepReasons}
                name="view-rep-reasons"
                idFieldName="name"
                sortOptions={[
                  {
                    label: 'Created at',
                    fieldName: 'createdat',
                  },
                ]}
                defaultFieldName={'createdat'}
                urlWithSubViewNameAndPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
                  ':tabName',
                  'reputation'
                )}
                filters={[
                  {
                    fieldName: 'createdby',
                    label: 'Created By',
                    type: FilterType.Equal,
                    subType: FilterSubType.UserId,
                  },
                ]}>
                <RendererReasons />
              </PaginatedView>
            ),
          },
        ]}
      />
    </>
  )
}
