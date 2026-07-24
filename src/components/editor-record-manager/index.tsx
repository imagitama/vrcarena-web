import React from 'react'
import { makeStyles } from '@mui/styles'
import EditIcon from '@mui/icons-material/Edit'

import {
  ArchivedReason,
  CollectionNames as AssetsCollectionNames,
  DeclinedReason,
  DeletionReason,
} from '@/modules/assets'
import { CollectionNames as AmendmentsCollectionNames } from '@/modules/amendments'
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
import ErrorBoundary from '@/components/error-boundary'
import { mediaQueryForTabletsOrBelow } from '@/media-queries'
import { UserFromView } from '@/modules/users'

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
    [mediaQueryForTabletsOrBelow]: {
      flexWrap: 'wrap',
    },
  },
  cell: {
    '&:nth-child(1)': {
      width: '25%',
    },
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
      '&:nth-child(1)': {
        width: '100%',
      },
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
  // conditions
  showPublishButtons,
  showApprovalButtons,
  showDeclineReasons,
  showAccessButtons,
  showArchiveButton,
  showFeatureButtons,
  showEditorNotes,
  // callbacks
  onDone,
  // hooks
  beforeApprove,
}: {
  id: string
  metaCollectionName: string
  collectionName?: string
  editUrl?: string
  onDone?: () => void
  // save us a trip
  existingApprovalStatus?: ApprovalStatus
  existingPublishStatus?: PublishStatus
  existingAccessStatus?: AccessStatus
  existingEditorNotes?: string | null
  existingFeaturedStatus?: FeaturedStatus
  // specifically for assets and some other record types
  existingDeletionReason?: DeletionReason | null
  existingArchivedReason?: ArchivedReason | null
  existingDeclinedReasons?: DeclinedReason[] | null
  // conditions
  showApprovalButtons?: boolean
  showPublishButtons?: boolean
  showAccessButtons?: boolean
  showArchiveButton?: boolean
  showEditorNotes?: boolean
  showFeatureButtons?: boolean
  showDeclineReasons?: boolean
  // hooks
  beforeApprove?: () => boolean | Promise<boolean>
}) => {
  const classes = useStyles()
  return (
    <ErrorBoundary>
      <EditorBox className={classes.root}>
        {editUrl && (
          <div style={{ marginBottom: '0.25rem' }}>
            <Button
              icon={<EditIcon />}
              url={editUrl}
              size="small"
              color="secondary">
              Edit Record
            </Button>
          </div>
        )}
        <div className={classes.rows}>
          {showPublishButtons && (
            <div className={classes.row}>
              {existingPublishStatus !== undefined && (
                <div className={classes.cell}>
                  <MetaStatus
                    status={existingPublishStatus}
                    type={PublishStatus}
                  />
                </div>
              )}
            </div>
          )}
          {showApprovalButtons && (
            <div className={classes.row}>
              {existingApprovalStatus !== undefined && (
                <div className={classes.cell}>
                  <MetaStatus
                    status={existingApprovalStatus}
                    type={ApprovalStatus}
                  />
                </div>
              )}
              <div className={classes.cell}>
                <ApproveButton
                  id={id}
                  metaCollectionName={metaCollectionName}
                  existingApprovalStatus={existingApprovalStatus}
                  existingDeclinedReasons={existingDeclinedReasons}
                  onDone={onDone}
                  beforeApprove={beforeApprove}
                  showDeclineReasons={showDeclineReasons}
                />
              </div>
            </div>
          )}
          {showAccessButtons && (
            <div className={classes.row}>
              {existingAccessStatus !== undefined && (
                <div className={classes.cell}>
                  <MetaStatus
                    status={existingAccessStatus}
                    type={AccessStatus}
                  />
                </div>
              )}
              <div className={classes.cell}>
                <DeleteButton
                  id={id}
                  metaCollectionName={metaCollectionName}
                  existingAccessStatus={existingAccessStatus}
                  existingDeletionReason={existingDeletionReason}
                  onDone={onDone}
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
            </div>
          )}
          {showFeatureButtons ? (
            <div className={classes.row}>
              {existingFeaturedStatus !== undefined && (
                <div className={classes.cell}>
                  <MetaStatus
                    status={existingFeaturedStatus}
                    type={FeaturedStatus}
                  />
                </div>
              )}
              {showFeatureButtons && (
                <div className={classes.cell}>
                  <FeatureButton
                    id={id}
                    metaCollectionName={metaCollectionName}
                    existingFeaturedStatus={existingFeaturedStatus}
                    onDone={onDone}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
        {showEditorNotes && (
          <div className={classes.item}>
            <PublicEditorNotesForm
              id={id}
              metaCollectionName={metaCollectionName}
              existingEditorNotes={existingEditorNotes}
              onDone={onDone}
            />
          </div>
        )}
      </EditorBox>
    </ErrorBoundary>
  )
}

export default EditorRecordManager
