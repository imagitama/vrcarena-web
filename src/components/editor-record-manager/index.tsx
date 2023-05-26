import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import EditIcon from '@material-ui/icons/Edit'

import ApproveButton from '../approve-button'
import DeleteButton from '../delete-button'
import PublicEditorNotesForm from '../public-editor-notes-form'
import Button from '../button'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  box: {
    border: '2px dashed rgba(255, 255, 0, 0.5)'
  },
  noBox: {},
  item: {
    padding: '0.5rem'
  }
}))

export default ({
  // required
  id,
  metaCollectionName,
  collectionName,
  // optional
  editUrl,
  // existing
  existingApprovalStatus,
  existingPublishStatus,
  existingAccessStatus,
  existingEditorNotes,
  // callbacks
  onDone = undefined,
  // visibility
  showEditButtons = false,
  showApprovalButtons = true,
  // showPublishButtons = true,
  showAccessButtons = true,
  showEditorNotes = true,
  // hooks
  beforeApprove = undefined,
  // other
  callOnDoneOnEditorNotes = false,
  allowDeclineOptions = false,
  showBox = true
}: {
  id: string
  collectionName?: string
  metaCollectionName: string
  editUrl?: string
  existingApprovalStatus?: string
  existingPublishStatus?: string
  existingAccessStatus?: string
  existingEditorNotes?: string
  onDone?: () => void
  showEditButtons?: boolean
  showApprovalButtons?: boolean
  showPublishButtons?: boolean
  showAccessButtons?: boolean
  showEditorNotes?: boolean
  beforeApprove?: () => void
  callOnDoneOnEditorNotes?: boolean
  allowDeclineOptions?: boolean
  showBox?: boolean
}) => {
  const classes = useStyles()
  return (
    <div className={`${classes.root} ${showBox ? classes.box : classes.noBox}`}>
      {showEditButtons ? (
        <div className={classes.item}>
          <Button icon={<EditIcon />} url={editUrl}>
            Edit
          </Button>
        </div>
      ) : null}
      {showApprovalButtons ? (
        <div className={classes.item}>
          <ApproveButton
            id={id}
            metaCollectionName={metaCollectionName}
            // @ts-ignore
            existingApprovalStatus={existingApprovalStatus}
            // @ts-ignore
            existingPublishStatus={existingPublishStatus}
            // @ts-ignore
            onDone={onDone}
            // @ts-ignore
            beforeApprove={beforeApprove}
            allowDeclineOptions={allowDeclineOptions}
          />
        </div>
      ) : null}
      {showAccessButtons ? (
        <div className={classes.item}>
          <DeleteButton
            id={id}
            metaCollectionName={metaCollectionName}
            // @ts-ignore
            existingAccessStatus={existingAccessStatus}
            // @ts-ignore
            onDone={onDone}
          />
        </div>
      ) : null}
      {showEditorNotes ? (
        <div className={classes.item}>
          <PublicEditorNotesForm
            id={id}
            metaCollectionName={metaCollectionName}
            // @ts-ignore
            existingEditorNotes={existingEditorNotes}
            // @ts-ignore
            onDone={callOnDoneOnEditorNotes ? onDone : undefined}
          />
        </div>
      ) : null}
    </div>
  )
}
