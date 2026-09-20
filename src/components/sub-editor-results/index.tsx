import {
  FullSubEditorResponse,
  SubEditorResponseField,
} from '@/modules/subeditorresponses'

import Table, {
  TableRow,
  TableCell,
  TableBody,
  TableHead,
} from '@/components/responsive-table'
import UsernameLink from '@/components/username-link'
import FormattedDate from '@/components/formatted-date'
import GenericOutputItem from '@/components/generic-output-item'
import { OutcomeValue } from '@/components/sub-editor-response-form'
import NoValueLabel from '@/components/no-value-label'

import assetsEditableFields from '@/editable-fields/assets'
import StatusText from '../status-text'

const editableOrder = new Map(
  assetsEditableFields.map((editableField, index) => [
    editableField.name,
    index,
  ])
)

const sortFields = ([nameA]: [string, any], [nameB]: [string, any]) => {
  const indexA = editableOrder.get(nameA) ?? Infinity
  const indexB = editableOrder.get(nameB) ?? Infinity

  if (indexA === indexB) return 0
  return indexA < indexB ? -1 : 1
}

const OutcomeFields = ({
  fields,
}: {
  fields: { [fieldName: string]: SubEditorResponseField }
}) => {
  return (
    <Table size="small" noMinWidth>
      <TableBody>
        {Object.entries(fields)
          .sort(sortFields)
          .map(([fieldName, field]) => {
            const editableField = assetsEditableFields.find(
              (editableField) => editableField.name === fieldName
            )
            if (!editableField)
              throw new Error(`No editable field with name "${fieldName}"`)
            return (
              <TableRow key={fieldName}>
                <TableCell>
                  <small>{editableField.label}</small>
                </TableCell>
                <TableCell>
                  <StatusText positivity={field.verdict === true ? 1 : -1}>
                    <small>
                      {field.verdict === true ? 'Approve' : 'Decline'}
                    </small>
                  </StatusText>
                </TableCell>
                <TableCell>
                  <small>
                    {field.comments || <NoValueLabel>-</NoValueLabel>}
                  </small>
                </TableCell>
              </TableRow>
            )
          })}
      </TableBody>
    </Table>
  )
}

export const SubEditorResults = ({
  items,
  showParents = true,
}: {
  items: FullSubEditorResponse[]
  showParents?: boolean
}) => (
  <Table size="small">
    <TableHead>
      {showParents && <TableCell width="25%">Parent</TableCell>}
      <TableCell width={showParents ? '25%' : '50%'}>By</TableCell>
      <TableCell width="50%">Outcome</TableCell>
    </TableHead>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.id}>
          {showParents && (
            <TableCell>
              <GenericOutputItem
                type={item.parenttable}
                id={item.parentid}
                data={item.parentdata as any}
                extraProps={{
                  isTiny: true,
                  showState: true,
                }}
              />
            </TableCell>
          )}
          <TableCell>
            <UsernameLink
              id={item.createdby}
              username={item.createdbyusername}
              avatarUrl={item.createdbyavatarurl}
              reputation={item.createdbyreputation}
            />
            <br />
            <FormattedDate date={item.createdat} />
          </TableCell>
          <TableCell>
            <OutcomeValue fields={item} />
            <br />
            {item.fields !== null ? (
              <OutcomeFields fields={item.fields} />
            ) : null}
            <br />
            {item.comments || <NoValueLabel>(no comments)</NoValueLabel>}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export default SubEditorResults
