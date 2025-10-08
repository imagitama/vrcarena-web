import React, { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'

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
import TextInput from '@/components/text-input'
import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import SuccessMessage from '@/components/success-message'

const RendererChanges = ({ items }: { items?: FullRepChange[] }) => (
  <RepChangeList repChanges={items!} />
)

const RepReasonRow = ({ repReason }: { repReason: RepReason }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newFields, setNewFields] = useState<RepReason>(repReason)
  const [isSaving, isSuccess, lastErrorCode, save] =
    useDataStoreEdit<RepReason>(CollectionNames.RepReasons, repReason.name, {
      idField: 'name',
    })

  const onFieldChange = (fieldName: keyof RepReason, value: any) =>
    setNewFields((currentFields) => ({
      ...currentFields,
      [fieldName]: value,
    }))

  const onClickSave = () => save(newFields)

  if (isEditing) {
    return (
      <TableRow key={repReason.name}>
        <TableCell title={repReason.name}>
          <TextInput fullWidth size="small" value={newFields.name} isDisabled />
          <br />
          <em>(cannot be changed)</em>
          {isSaving ? <LoadingIndicator message="Saving..." /> : null}
          {isSuccess ? (
            <SuccessMessage>Saved successfully</SuccessMessage>
          ) : null}
          {lastErrorCode !== null ? (
            <ErrorMessage>Failed to save (code {lastErrorCode})</ErrorMessage>
          ) : null}
        </TableCell>
        <TableCell>
          <TextInput
            fullWidth
            size="small"
            value={newFields.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            isDisabled={isSaving}
          />
        </TableCell>
        <TableCell>
          <TextInput
            type="number"
            size="small"
            value={newFields.delta}
            onChange={(e) => onFieldChange('delta', e.target.value)}
            isDisabled={isSaving}
          />
          <br />
          <em>Whole positive numbers only</em>
        </TableCell>
        <TableCell>
          <FormattedDate date={repReason.createdat} />
          {repReason.createdby ? (
            <> by {repReason.createdby.substring(0, 5)}...</>
          ) : null}
        </TableCell>
        <TableCell>
          <SaveIcon onClick={() => onClickSave()} />
          <CancelIcon onClick={() => setIsEditing(false)} />
        </TableCell>
      </TableRow>
    )
  } else {
    return (
      <TableRow key={repReason.name}>
        <TableCell title={repReason.name}>{repReason.name}</TableCell>
        <TableCell>{repReason.description}</TableCell>
        <TableCell>
          <StatusText positivity={repReason.delta > 0 ? 1 : -1}>
            {repReason.delta}
          </StatusText>
        </TableCell>
        <TableCell>
          <FormattedDate date={repReason.createdat} />
          {repReason.createdby ? (
            <> by {repReason.createdby.substring(0, 5)}...</>
          ) : null}
        </TableCell>
        <TableCell>
          <EditIcon onClick={() => setIsEditing(true)} />
        </TableCell>
      </TableRow>
    )
  }
}

const RendererReasons = ({ items }: { items?: RepReason[] }) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Description</TableCell>
        <TableCell>Delta</TableCell>
        <TableCell>Meta</TableCell>
        <TableCell> </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items!.length ? (
        items!.map((repReason) => (
          <RepReasonRow repReason={repReason} key={repReason.name} />
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={999}>
            <NoResultsMessage>No reasons found</NoResultsMessage>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
)

export default () => {
  return (
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
              urlWithPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
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
          label: 'Editor',
          contents: (
            <PaginatedView<RepReason>
              viewName={CollectionNames.RepReasons}
              name="view-rep-reasons"
              sortOptions={[
                {
                  label: 'Created at',
                  fieldName: 'createdat',
                },
              ]}
              defaultFieldName={'createdat'}
              urlWithPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
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
  )
}
