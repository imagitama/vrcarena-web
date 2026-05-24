import React from 'react'
import { makeStyles } from '@mui/styles'
import EditIcon from '@mui/icons-material/Edit'

import {
  ArchivedReason,
  DeclinedReason,
  DeletionReason,
} from '@/modules/assets'
import {
  AccessStatus,
  ApprovalStatus,
  FeaturedStatus,
  PublishStatus,
} from '@/modules/common'

import ApproveButton from '@/components/approve-button'
import DeleteButton from '@/components/delete-button'
import PublicEditorNotesForm from '@/components/public-editor-notes-form'
import Button from '@/components/button'
import FeatureButton from '@/components/feature-button'
import EditorBox from '@/components/editor-box'
import ArchiveButton from '@/components/archive-button'
import MetaStatus from '@/components/meta-status'
import AdminPublishButton from '@/components/admin-publish-button'
import ErrorBoundary from '@/components/error-boundary'

const useStyles = makeStyles(() => ({
  root: {
    maxWidth: '500px',
  },
  item: {},
  rows: {},
  row: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginBottom: '0.75rem',
  },
  cell: {
    '&:nth-child(1)': {
      width: '25%',
    },
  },
}))

const EditorRecordManager = ({
  // required
  id,
  metaCollectionName,
  // optional
  editUrl,
  // existing
  existingApprovalStatus,
  existingPublishStatus,
  existingAccessStatus,
  existingEditorNotes,
  existingFeaturedStatus,
  // for assets
  existingDeletionReason,
  existingDeclinedReasons,
  existingArchivedReason,
  // callbacks
  onDone = undefined,
  // visibility
  showStatuses = true, // this data is very important so ensure
  showApprovalButtons = true,
  showAccessButtons = true,
  showEditorNotes = true,
  showArchiveButton = false,
  showFeatureButtons = false,
  showPublishButtons = true, // true so we can see publishstatus
  // hooks
  beforeApprove = undefined,
  // other
  callOnDoneOnEditorNotes = true,
  showBox = true,
  comments,
  small = false,
}: {
  id: string
  metaCollectionName: string
  collectionName?: string
  editUrl?: string
  existingApprovalStatus?: ApprovalStatus
  existingPublishStatus?: PublishStatus
  existingAccessStatus?: AccessStatus
  existingEditorNotes?: string
  existingFeaturedStatus?: FeaturedStatus
  // assets
  existingDeletionReason?: DeletionReason | null
  existingArchivedReason?: ArchivedReason | null
  existingDeclinedReasons?: DeclinedReason[] | null
  onDone?: () => void
  showStatuses?: boolean
  showApprovalButtons?: boolean
  showPublishButtons?: boolean
  showAccessButtons?: boolean
  showArchiveButton?: boolean
  showEditorNotes?: boolean
  showFeatureButtons?: boolean
  beforeApprove?: () => boolean | Promise<boolean>
  callOnDoneOnEditorNotes?: boolean
  showBox?: boolean
  comments?: string
  small?: boolean
}) => {
  const classes = useStyles()
  return (
    <ErrorBoundary>
      <EditorBox className={classes.root} show={showBox}>
        {editUrl ? (
          <div>
            <Button
              icon={<EditIcon />}
              url={editUrl}
              size="small"
              color="secondary">
              Edit Record
            </Button>
          </div>
        ) : null}
        {comments ? (
          <>
            <br />
            {comments}
          </>
        ) : null}
        <div className={classes.rows}>
          {showStatuses || showPublishButtons ? (
            <div className={classes.row}>
              {showStatuses && showPublishButtons && existingPublishStatus && (
                <div className={classes.cell}>
                  <MetaStatus
                    status={existingPublishStatus}
                    type={PublishStatus}
                  />
                </div>
              )}
              {showPublishButtons && (
                <div className={classes.cell}>
                  <AdminPublishButton
                    assetId={id}
                    existingPublishStatus={existingPublishStatus}
                    onDone={onDone}
                  />
                </div>
              )}
            </div>
          ) : null}
          {showStatuses || showApprovalButtons ? (
            <div className={classes.row}>
              {showStatuses && existingApprovalStatus && (
                <div className={classes.cell}>
                  <MetaStatus
                    status={existingApprovalStatus}
                    type={ApprovalStatus}
                  />
                </div>
              )}
              {showApprovalButtons && (
                <div className={classes.cell}>
                  <ApproveButton
                    id={id}
                    metaCollectionName={metaCollectionName}
                    existingApprovalStatus={existingApprovalStatus}
                    existingDeclinedReasons={existingDeclinedReasons}
                    onDone={onDone}
                    beforeApprove={beforeApprove}
                  />
                </div>
              )}
            </div>
          ) : null}
          {showStatuses || showAccessButtons ? (
            <div className={classes.row}>
              {showStatuses && existingAccessStatus && (
                <div className={classes.cell}>
                  <MetaStatus
                    status={existingAccessStatus}
                    type={AccessStatus}
                  />
                </div>
              )}
              {showAccessButtons && (
                <div className={classes.cell}>
                  <DeleteButton
                    id={id}
                    metaCollectionName={metaCollectionName}
                    existingAccessStatus={existingAccessStatus}
                    existingDeletionReason={existingDeletionReason}
                    onDone={onDone}
                    hollow={small === true}
                  />
                  {showArchiveButton ? (
                    <>
                      <div style={{ marginTop: '0.25rem' }} />
                      <ArchiveButton
                        id={id}
                        metaCollectionName={metaCollectionName}
                        existingAccessStatus={existingAccessStatus}
                        existingArchivedReason={existingArchivedReason}
                        onDone={onDone}
                      />
                    </>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
          {showStatuses || showFeatureButtons ? (
            <div className={classes.row}>
              {showStatuses && <div className={classes.cell}></div>}
              {showFeatureButtons && (
                <div className={classes.cell}>
                  <FeatureButton
                    id={id}
                    existingFeaturedStatus={existingFeaturedStatus}
                    onDone={onDone}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
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
      </EditorBox>
    </ErrorBoundary>
  )
}

export default EditorRecordManager
