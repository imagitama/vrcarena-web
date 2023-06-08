import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  CollectionNames as CommentsCollectionNames,
  CommentsMetaFieldNames
} from '../../modules/comments'
import {
  createMessage,
  editMessage,
  FullHistoryEntry
} from '../../modules/history'
import { CollectionNames as AssetsCollectionNames } from '../../modules/assets'
import { getUrlForParent, getLabelForParent } from '../../utils'
import Link from '../link'
import UsernameLink from '../username-link'
import {
  AccessStatuses,
  ApprovalStatuses,
  AssetMetaFieldNames,
  BanStatuses,
  PublishStatuses,
  UserMetaFieldNames
} from '../../hooks/useDatabaseQuery'
import FormattedDate from '../formatted-date'
import {
  AmendmentsMetaFieldNames,
  CollectionNames as AmendmentsCollectionNames
} from '../../modules/amendments'
import { CollectionNames as UsersCollectionNames } from '../../modules/users'
import ErrorBoundary from '../error-boundary'
import {
  CollectionNames as ReportsCollectionNames,
  ReportMetaFieldNames,
  ResolutionStatuses
} from '../../modules/reports'
import { CollectionNames as AuthorsCollectionNames } from '../../modules/authors'

const getLabelForApprovalStatus = (approvalStatus: string): string => {
  switch (approvalStatus) {
    case ApprovalStatuses.Approved:
      return 'approved'
    case ApprovalStatuses.Declined:
      return 'declined'
    case ApprovalStatuses.Waiting:
      return 'reverted back to waiting'
    default:
      throw new Error(`Unknown approval status: ${approvalStatus}`)
  }
}

const getLabelForAccessStatus = (accessStatus: string): string => {
  switch (accessStatus) {
    case AccessStatuses.Deleted:
      return 'moved to trash'
    case AccessStatuses.Public:
      return 'moved out of trash'
    default:
      throw new Error(`Unknown access status: ${accessStatus}`)
  }
}

const getLabelForPublishStatus = (publishStatus: string): string => {
  switch (publishStatus) {
    case PublishStatuses.Draft:
      return 'moved back to draft'
    case PublishStatuses.Published:
      return 'published for approval'
    default:
      throw new Error(`Unknown publish status: ${publishStatus}`)
  }
}

const getLabelForBanStatus = (banStatus: string): string => {
  switch (banStatus) {
    case BanStatuses.Banned:
      return 'banned'
    case BanStatuses.Unbanned:
      return 'unbanned'
    default:
      throw new Error(`Unknown publish status: ${banStatus}`)
  }
}

const getLabelForResolutionStatus = (resolutionStatus: string): string => {
  switch (resolutionStatus) {
    case ResolutionStatuses.Pending:
      return 'unresolved'
    case ResolutionStatuses.Resolved:
      return 'resolved'
    default:
      throw new Error(`Unknown publish status: ${resolutionStatus}`)
  }
}

const useStyles = makeStyles({
  entry: {
    marginBottom: '0.5rem'
  },
  text: {},
  date: {
    fontSize: '50%',
    // textAlign: 'right',
    marginTop: '0.25rem'
  }
})

const LabelForEntry = ({
  entry: { message, data, parent, parenttable, parentdata, createdby }
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
            [fieldName]: newValue
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
          if (data.changes[AssetMetaFieldNames.approvalStatus]) {
            return (
              <>
                {getLabelForApprovalStatus(
                  data.changes[AssetMetaFieldNames.approvalStatus]
                )}
              </>
            )
          } else if (data.changes[AssetMetaFieldNames.accessStatus]) {
            return (
              <>
                {getLabelForAccessStatus(
                  data.changes[AssetMetaFieldNames.accessStatus]
                )}
              </>
            )
          } else if (data.changes[AssetMetaFieldNames.publishStatus]) {
            return (
              <>
                {getLabelForPublishStatus(
                  data.changes[AssetMetaFieldNames.publishStatus]
                )}
              </>
            )
          } else if (data.changes[AssetMetaFieldNames.editorNotes]) {
            return <>changed editor notes for asset</>
          } else {
            return null
          }
        case AmendmentsCollectionNames.AmendmentsMeta:
          if (data.changes[AmendmentsMetaFieldNames.approvalstatus]) {
            return (
              <>
                {AmendmentsMetaFieldNames.approvalstatus ===
                ApprovalStatuses.Approved
                  ? 'applied'
                  : getLabelForApprovalStatus(
                      data.changes[AmendmentsMetaFieldNames.approvalstatus]
                    )}
              </>
            )
          } else if (data.changes[AmendmentsMetaFieldNames.editornotes]) {
            return <>changed editor notes for amendment</>
          }
        case UsersCollectionNames.Users:
          if (parent !== createdby) {
            return (
              <>changed {Object.keys(changesWithoutMetafields).length} fields</>
            )
          }
        case UsersCollectionNames.UsersMeta:
          if (data.changes[UserMetaFieldNames.banStatus]) {
            return (
              <>
                {getLabelForBanStatus(
                  data.changes[UserMetaFieldNames.banStatus]
                )}{' '}
                user
              </>
            )
          }
        case AuthorsCollectionNames.Authors:
          return <>edited author</>
        case ReportsCollectionNames.ReportsMeta:
          if (data.changes[ReportMetaFieldNames.resolutionstatus]) {
            return (
              <>
                {getLabelForResolutionStatus(
                  data.changes[ReportMetaFieldNames.resolutionstatus]
                )}{' '}
                report
              </>
            )
          } else if (data.changes[ReportMetaFieldNames.resolutionnotes]) {
            return <>changed the resolution notes</>
          } else if (data.changes[ReportMetaFieldNames.editornotes]) {
            return <>changed editor notes for report</>
          } else {
            return (
              <>changed {Object.keys(changesWithoutMetafields).join(', ')}</>
            )
          }
        case CommentsCollectionNames.CommentsMeta:
          if (data.changes[CommentsMetaFieldNames.accessStatus]) {
            return (
              <>
                {getLabelForAccessStatus(
                  data.changes[CommentsMetaFieldNames.accessStatus]
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
      {entries.map(entry => (
        <ErrorBoundary key={entry.id}>
          <Entry entry={entry} />
        </ErrorBoundary>
      ))}
    </div>
  )
}
