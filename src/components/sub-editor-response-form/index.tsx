import { useEffect, useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import styled from '@emotion/styled'
import ButtonGroup from '@mui/material/ButtonGroup'
import DoneIcon from '@mui/icons-material/Done'
import CloseIcon from '@mui/icons-material/Close'
// import RemoveIcon from '@mui/icons-material/Remove'

import useDataStoreEditOrCreate from '@/hooks/useDataStoreEditOrCreate'
import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'
import useUserId from '@/hooks/useUserId'

import {
  CollectionNames,
  SubEditorResponse,
  SubEditorResponseField,
  SubEditorResponseFields,
} from '@/modules/subeditorresponses'
import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
import assetsEditableFields from '@/editable-fields/assets'
import { smoothScrollToTop } from '@/utils'
import { Edit as EditIcon, SubEditor as SubEditorIcon } from '@/icons'

import { ApproveButtonBase } from '../approve-button'
import Button from '../button'
import TextInput from '../text-input'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
// import { DeleteButtonBase } from '../delete-button'
import { ApprovalStatus } from '@/modules/common'
// import { ArchiveButtonBase } from '../archive-button'
import Message from '../message'
import FormControls from '../form-controls'
import StatusText from '../status-text'
import Table, { TableBody, TableCell, TableRow } from '../responsive-table'
import Heading from '../heading'

const Row = styled.div`
  padding: 0.25rem 0;
`

export const OutcomeValue = ({
  fields,
}: {
  fields: SubEditorResponseFields
}) => {
  if (fields.approvalstatus !== null) {
    switch (fields.approvalstatus) {
      case ApprovalStatus.Approved:
        return <StatusText positivity={1}>Approved</StatusText>
      case ApprovalStatus.Declined:
        return (
          <StatusText positivity={-1}>
            Declined
            {fields.declinedreasons !== null &&
            fields.declinedreasons.length ? (
              <>
                :
                <ul style={{ margin: 0 }}>
                  {fields.declinedreasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </StatusText>
        )
    }
  }

  return null
}

const Outcome = ({ fields }: { fields: SubEditorResponseFields }) => {
  if (fields.approvalstatus === null) return null

  return (
    <Row>
      The outcome of your response: <OutcomeValue fields={fields} />
    </Row>
  )
}

const Form = ({
  parentType,
  parentId,
  hydrate,
}: {
  parentType: string
  parentId: string
  hydrate: () => void
}) => {
  const myUserId = useUserId()
  const isAsset = parentType === AssetsCollectionNames.Assets
  const [isExpanded, setIsExpanded] = useState<null | boolean>(null)

  const [isLoading, lastErrorCodeLoading, lastResult] =
    useDatabaseQuery<SubEditorResponse>(
      CollectionNames.SubEditorResponses,
      [
        ['parenttable', Operators.EQUALS, parentType],
        ['parentid', Operators.EQUALS, parentId],
        ['createdby', Operators.EQUALS, myUserId!],
      ],
      {
        queryName: 'my-sub-editor-response',
      }
    )

  const existingResponse =
    lastResult === null ? null : lastResult.length > 0 ? lastResult[0] : false
  const existingId = existingResponse ? existingResponse.id : null

  useEffect(() => {
    if (!existingResponse) return
    setIsExpanded(false)
    setFormFields({
      parenttable: existingResponse.parenttable,
      parentid: existingResponse.parentid,
      fields: existingResponse.fields,
      accessstatus: existingResponse.accessstatus,
      deletionreason: existingResponse.deletionreason,
      archivedreason: existingResponse.archivedreason,
      approvalstatus: existingResponse.approvalstatus,
      declinedreasons: existingResponse.declinedreasons,
      comments: existingResponse.comments,
    })
  }, [existingResponse !== null])

  const [formFields, setFormFields] = useState<SubEditorResponseFields>({
    parenttable: parentType,
    parentid: parentId,
    fields: null,
    accessstatus: null,
    deletionreason: null,
    archivedreason: null,
    approvalstatus: null,
    declinedreasons: null,
    comments: null,
  })
  const [isSaving, isSuccess, lastErrorCodeSaving, createOrEdit, clear] =
    useDataStoreEditOrCreate<SubEditorResponseFields>(
      CollectionNames.SubEditorResponses,
      existingId || false
    )

  const setField = (fieldName: keyof SubEditorResponseFields, value: any) => {
    setFormFields((currentVal) => ({
      ...currentVal,
      [fieldName]: value,
    }))
  }

  const onClickSave = async () => {
    if (formFields.approvalstatus === null) return

    await createOrEdit(formFields)

    smoothScrollToTop()
  }

  if (isLoading) return <LoadingIndicator message="Loading responses..." />

  if (lastErrorCodeLoading)
    return (
      <ErrorMessage errorCode={lastErrorCodeLoading}>
        Failed to load response
      </ErrorMessage>
    )

  if (isSaving)
    return (
      <LoadingIndicator
        message={`${existingId ? 'Updating' : 'Adding'} response...`}
      />
    )

  if (lastErrorCodeSaving !== null)
    return (
      <ErrorMessage errorCode={lastErrorCodeSaving}>
        Failed to {existingId ? 'update' : 'add'} response
      </ErrorMessage>
    )

  if (isSuccess)
    return (
      <SuccessMessage
        onOkay={() => {
          hydrate()
          clear()
          setIsExpanded(false)
        }}>
        Your response has been {existingId ? 'updated' : 'added'} successfully
      </SuccessMessage>
    )

  // const approveVerdict = (fieldName: keyof Asset) =>
  //   setFormFields((currentVal) => ({
  //     ...currentVal,
  //     fields: {
  //       ...(currentVal.fields || {}),
  //       [fieldName]: {
  //         verdict: true,
  //       },
  //     },
  //   }))

  const clearVerdict = (fieldName: keyof Asset) =>
    setFormFields((currentVal) => {
      const newFields = { ...(currentVal.fields || {}) }
      delete newFields[fieldName]
      return {
        ...currentVal,
        fields: newFields,
      }
    })

  const declineVerdict = (fieldName: keyof Asset) =>
    setFormFields((currentVal) => ({
      ...currentVal,
      fields: {
        ...(currentVal.fields || {}),
        [fieldName]: {
          verdict: false,
          comments: '',
        },
      },
    }))

  const updateVerdictComment = (fieldName: keyof Asset, comment: string) =>
    setFormFields((currentVal) => ({
      ...currentVal,
      fields: {
        ...(currentVal.fields || {}),
        [fieldName]: {
          verdict: false,
          comments: comment,
        },
      },
    }))

  if (isExpanded === false)
    return (
      <>
        <br />
        <SuccessMessage
          controls={
            <Button
              onClick={() => setIsExpanded(true)}
              color="secondary"
              hollow
              icon={<EditIcon />}>
              Edit My Response
            </Button>
          }>
          You have submitted a community response for this asset or amendment.
        </SuccessMessage>
      </>
    )

  return (
    <>
      <Row>
        <Heading variant="h3">Field Review</Heading>
        <Table size="small">
          <TableBody>
            {assetsEditableFields.map((editableField) => {
              const value: SubEditorResponseField | null = formFields.fields
                ? formFields.fields[editableField.name]
                : null
              const verdict: boolean | null =
                value?.verdict !== undefined ? value.verdict : null
              const isCommentFieldEnabled = verdict === false
              return (
                <TableRow key={editableField.name}>
                  <TableCell width="25%">{editableField.label}</TableCell>
                  <TableCell width="25%">
                    <ButtonGroup>
                      {/* <Button
                        size="small"
                        icon={<DoneIcon />}
                        title="You approve this field"
                        onClick={() => approveVerdict(editableField.name)}
                        color={verdict === true ? 'primary' : 'secondary'}
                      /> */}
                      <Button
                        size="small"
                        icon={<DoneIcon />}
                        title="Clear your approval"
                        onClick={() => clearVerdict(editableField.name)}
                        color={verdict === null ? 'primary' : 'secondary'}
                      />
                      <Button
                        size="small"
                        icon={<CloseIcon />}
                        title="You decline this field"
                        onClick={() => declineVerdict(editableField.name)}
                        color={verdict === false ? 'primary' : 'secondary'}
                      />
                    </ButtonGroup>
                  </TableCell>
                  <TableCell width="50%">
                    <TextInput
                      fullWidth
                      label="Reason For Decline"
                      size="small"
                      isDisabled={!isCommentFieldEnabled}
                      value={value?.comments || ''}
                      onChange={(e) =>
                        updateVerdictComment(editableField.name, e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Row>
      <Row>
        <Heading variant="h3">Approval</Heading>
        <ApproveButtonBase
          isAsset={isAsset}
          existingApprovalStatus={formFields.approvalstatus}
          existingDeclinedReasons={formFields.declinedreasons}
          onApprove={() => {
            setFormFields((currentVal) => ({
              ...currentVal,
              approvalstatus: ApprovalStatus.Approved,
              declinedreasons: null,
              accessstatus: null,
              deletionreason: null,
              archivedreason: null,
            }))
          }}
          onDecline={(reasons) => {
            setFormFields((currentVal) => ({
              ...currentVal,
              approvalstatus: ApprovalStatus.Declined,
              declinedreasons: reasons,
              accessstatus: null,
              deletionreason: null,
              archivedreason: null,
            }))
          }}
          onReasonsChange={(reasons) => {
            setField('declinedreasons', reasons)
          }}
        />
      </Row>
      {/* <Row>
        <DeleteButtonBase
          isAsset={isAsset}
          existingAccessStatus={fields.accessstatus}
          existingReason={fields.deletionreason}
          onDelete={(reason) => {
            setFormFields((currentVal) => ({
              ...currentVal,
              approvalstatus: null,
              declinedreasons: null,
              accessstatus: AccessStatus.Deleted,
              deletionreason: reason,
              archivedreason: null,
            }))
          }}
          onUndelete={() => {
            setFormFields((currentVal) => ({
              ...currentVal,
              approvalstatus: null,
              declinedreasons: null,
              accessstatus: AccessStatus.Public,
              deletionreason: null,
              archivedreason: null,
            }))
          }}
          onReasonChange={(reason) => {
            setField('deletionreason', reason)
          }}
        />
      </Row> */}
      {/* {isAsset && (
        <Row>
          <ArchiveButtonBase
            existingAccessStatus={fields.accessstatus}
            existingArchivedReason={fields.archivedreason}
            onArchive={(reason) => {
              setFormFields((currentVal) => ({
                ...currentVal,
                approvalstatus: null,
                declinedreasons: null,
                accessstatus: AccessStatus.Archived,
                deletionreason: null,
                archivedreason: reason,
              }))
            }}
            onUnarchive={() => {
              setFormFields((currentVal) => ({
                ...currentVal,
                approvalstatus: null,
                declinedreasons: null,
                accessstatus: AccessStatus.Public,
                deletionreason: null,
                archivedreason: null,
              }))
            }}
            onReasonChange={(reason) => {
              setField('archivedreason', reason)
            }}
          />
        </Row>
      )} */}
      <Heading variant="h3">Outcome</Heading>
      <Outcome fields={formFields} />
      <Heading variant="h3">Comments</Heading>
      <TextInput
        fullWidth
        label="(optional)"
        multiline
        rows={2}
        value={formFields.comments || ''}
        onChange={(e) => setField('comments', e.target.value)}
      />
      <FormControls>
        <Button icon={<CheckIcon />} onClick={onClickSave}>
          {existingId ? 'Update' : 'Add'} Your Response
        </Button>
      </FormControls>
    </>
  )
}

const SubEditorResponseForm = ({
  parentType,
  parentId,
  hydrate,
}: {
  parentType: string
  parentId: string
  hydrate: () => void
}) => {
  return (
    <Message title="Your Community Response" icon={<SubEditorIcon />}>
      As a community editor you can review this{' '}
      {parentType === AssetsCollectionNames.Assets ? 'asset' : 'amendment'} to
      help our editorial team:
      <Form parentType={parentType} parentId={parentId} hydrate={hydrate} />
    </Message>
  )
}

export default SubEditorResponseForm
