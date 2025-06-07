import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  CommentMeta,
  CollectionNames as CommentsCollectionNames,
} from '../../modules/comments'
import {
  createMessage,
  editMessage,
  FullHistoryEntry,
} from '../../modules/history'
import {
  AssetMeta,
  CollectionNames as AssetsCollectionNames,
} from '../../modules/assets'
import { getUrlForParent, getLabelForParent } from '../../relations'
import Link from '../link'
import UsernameLink from '../username-link'
import FormattedDate from '../formatted-date'
import {
  AmendmentMeta,
  CollectionNames as AmendmentsCollectionNames,
} from '../../modules/amendments'
import {
  BanStatus,
  UserMeta,
  CollectionNames as UsersCollectionNames,
} from '../../modules/users'
import ErrorBoundary from '../error-boundary'
import {
  ReportMeta,
  CollectionNames as ReportsCollectionNames,
  ResolutionStatus,
} from '../../modules/reports'
import { CollectionNames as AuthorsCollectionNames } from '../../modules/authors'
import {
  AccessStatus,
  ApprovalStatus,
  PublishStatus,
} from '../../modules/common'

const getLabelForApprovalStatus = (approvalStatus: string): string => {
  switch (approvalStatus) {
    case ApprovalStatus.Approved:
      return 'approved'
    case ApprovalStatus.Declined:
      return 'declined'
    case ApprovalStatus.Waiting:
      return 'reverted back to waiting'
    default:
      throw new Error(`Unknown approval status: ${approvalStatus}`)
  }
}

const getLabelForAccessStatus = (accessStatus: string): string => {
  switch (accessStatus) {
    case AccessStatus.Deleted:
      return 'moved to trash'
    case AccessStatus.Public:
      return 'moved out of trash'
    default:
      throw new Error(`Unknown access status: ${accessStatus}`)
  }
}

const getLabelForPublishStatus = (publishStatus: string): string => {
  switch (publishStatus) {
    case PublishStatus.Draft:
      return 'moved back to draft'
    case PublishStatus.Published:
      return 'published for approval'
    default:
      throw new Error(`Unknown publish status: ${publishStatus}`)
  }
}

const getLabelForBanStatus = (banStatus: string): string => {
  switch (banStatus) {
    case BanStatus.Banned:
      return 'banned'
    case BanStatus.Unbanned:
      return 'unbanned'
    default:
      throw new Error(`Unknown publish status: ${banStatus}`)
  }
}

const getLabelForResolutionStatus = (resolutionStatus: string): string => {
  switch (resolutionStatus) {
    case ResolutionStatus.Pending:
      return 'unresolved'
    case ResolutionStatus.Resolved:
      return 'resolved'
    default:
      throw new Error(`Unknown publish status: ${resolutionStatus}`)
  }
}

const useStyles = makeStyles({
  entry: {
    marginBottom: '0.5rem',
  },
  text: {},
  date: {
    fontSize: '50%',
    // textAlign: 'right',
    marginTop: '0.25rem',
  },
})

const LabelForEntry = ({
  entry: { message, data, parent, parenttable, parentdata, createdby },
}: {
  entry: FullHistoryEntry
}) => {
  const changesWithoutMetafields = Object.entries(data.changes).reduce(
    (newChanges, [fieldName, newValue]) =>
      fieldName !== 'lastmodifiedat' &&
      fieldName !== 'lastmodifiedby' &&
      fieldName !== 'ts'
        ? {
            ...newChanges,
            [fieldName]: newValue,
          }
        : newChanges,
    {}
  )

  switch (message) {
    case createMessage:
      switch (parenttable) {
        case CommentsCollectionNames.Comments:
          return <>commented on</>
        default:
          return (
            <>
              Unsupported create - parent "{parenttable}
              {parent}"
            </>
          )
      }
    case editMessage:
      switch (parenttable) {
        case AssetsCollectionNames.Assets:
          return <>changed {Object.keys(changesWithoutMetafields).join(', ')}</>
        case AssetsCollectionNames.AssetsMeta:
          if ((data.changes as AssetMeta).approvalstatus) {
            return (
              <>
                {getLabelForApprovalStatus(
                  (data.changes as AssetMeta).approvalstatus
                )}
              </>
            )
          } else if ((data.changes as AssetMeta).accessstatus) {
            return (
              <>
                {getLabelForAccessStatus(
                  (data.changes as AssetMeta).accessstatus
                )}
              </>
            )
          } else if ((data.changes as AssetMeta).publishstatus) {
            return (
              <>
                {getLabelForPublishStatus(
                  (data.changes as AssetMeta).publishstatus
                )}
              </>
            )
          } else if ((data.changes as AssetMeta).editornotes) {
            return <>changed editor notes for asset</>
          } else {
            return null
          }
        case AmendmentsCollectionNames.AmendmentsMeta:
          if ((data.changes as AmendmentMeta).approvalstatus) {
            return (
              <>
                {(data.changes as AmendmentMeta).approvalstatus ===
                ApprovalStatus.Approved
                  ? 'applied'
                  : getLabelForApprovalStatus(
                      (data.changes as AmendmentMeta).approvalstatus
                    )}
              </>
            )
          } else if ((data.changes as AmendmentMeta).editornotes) {
            return <>changed editor notes for amendment</>
          }
        case UsersCollectionNames.Users:
          if (parent !== createdby) {
            return (
              <>changed {Object.keys(changesWithoutMetafields).length} fields</>
            )
          }
        case UsersCollectionNames.UsersMeta:
          if ((data.changes as UserMeta).banstatus) {
            return (
              <>
                {getLabelForBanStatus((data.changes as UserMeta).banstatus)}{' '}
                user
              </>
            )
          }
        case AuthorsCollectionNames.Authors:
          return <>edited author</>
        case ReportsCollectionNames.ReportsMeta:
          if ((data.changes as ReportMeta).resolutionstatus) {
            return (
              <>
                {getLabelForResolutionStatus(
                  (data.changes as ReportMeta).resolutionstatus
                )}{' '}
                report
              </>
            )
          } else if ((data.changes as ReportMeta).resolutionnotes) {
            return <>changed the resolution notes</>
          } else if ((data.changes as ReportMeta).editornotes) {
            return <>changed editor notes for report</>
          } else {
            return (
              <>changed {Object.keys(changesWithoutMetafields).join(', ')}</>
            )
          }
        case CommentsCollectionNames.CommentsMeta:
          if ((data.changes as CommentMeta).accessstatus) {
            return (
              <>
                {getLabelForAccessStatus(
                  (data.changes as CommentMeta).accessstatus
                )}{' '}
                comment
              </>
            )
          } else {
            return (
              <>changed {Object.keys(changesWithoutMetafields).join(', ')}</>
            )
          }
      }
  }

  return (
    <>
      Unknown message "{parenttable}/{parent}" - "{message}"<br />
      <textarea>{JSON.stringify(data, null, '  ')}</textarea>
    </>
  )
}

const getIfToShowOf = (parentTable: string) =>
  parentTable !== AssetsCollectionNames.AssetsMeta &&
  parentTable !== AmendmentsCollectionNames.AmendmentsMeta

const Entry = ({ entry }: { entry: FullHistoryEntry }) => {
  const classes = useStyles()

  return (
    <div className={classes.entry}>
      <div className={classes.text}>
        <UsernameLink id={entry.createdby} username={entry.createdbyusername} />{' '}
        <LabelForEntry entry={entry} />
        {getIfToShowOf(entry.parenttable) ? ' of ' : ' '}
        <Link
          to={getUrlForParent(
            entry.parenttable,
            entry.parent,
            entry.parentdata,
            entry.parentchilddata
          )}>
          {getLabelForParent(
            entry.parenttable,
            entry.parentdata,
            entry.parentchilddata
          )}
        </Link>
      </div>
      <div className={classes.date}>
        <FormattedDate date={entry.createdat} />
      </div>
    </div>
  )
}

export default ({ entries }: { entries: FullHistoryEntry[] }) => {
  return (
    <div>
      {entries.map((entry) => (
        <ErrorBoundary key={entry.id}>
          <Entry entry={entry} />
        </ErrorBoundary>
      ))}
    </div>
  )
}
