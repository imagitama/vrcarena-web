import React from 'react'

import { getLabelForAssetField } from '@/utils/assets'
import { CollectionNames as CommentsCollectionNames } from '@/modules/comments'
import { Message, HistoryEntry } from '@/modules/history'
import {
  Asset,
  AssetMeta,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
import {
  CollectionNames as AmendmentsCollectionNames,
  AmendmentMeta,
} from '@/modules/amendments'
import {
  BanStatus,
  CollectionNames as UsersCollectionNames,
} from '@/modules/users'
import {
  FullReport,
  CollectionNames as ReportsCollectionNames,
  ResolutionStatus,
} from '@/modules/reports'
import { CollectionNames as AuthorsCollectionNames } from '@/modules/authors'
import {
  AccessStatus,
  ApprovalStatus,
  MetaRecord,
  PublishStatus,
} from '@/modules/common'

const getLabelForApprovalStatus = (approvalStatus: ApprovalStatus): string => {
  switch (approvalStatus) {
    case ApprovalStatus.Approved:
      return 'approved'
    case ApprovalStatus.Declined:
      return 'declined'
    case ApprovalStatus.Waiting:
      return 'reverted back to waiting'
    case ApprovalStatus.AutoApproved:
      return 'auto-approved'
    default:
      throw new Error(`Unknown approval status: ${approvalStatus}`)
  }
}

const getLabelForAccessStatus = (accessStatus: AccessStatus): string => {
  switch (accessStatus) {
    case AccessStatus.Deleted:
      return 'moved to trash'
    case AccessStatus.Public:
      return 'moved out of trash'
    default:
      throw new Error(`Unknown access status: ${accessStatus}`)
  }
}

const getLabelForPublishStatus = (publishStatus: PublishStatus): string => {
  switch (publishStatus) {
    case PublishStatus.Draft:
      return 'moved back to draft'
    case PublishStatus.Published:
      return 'published for approval'
    default:
      throw new Error(`Unknown publish status: ${publishStatus}`)
  }
}

const getLabelForBanStatus = (banStatus: BanStatus): string => {
  switch (banStatus) {
    case BanStatus.Banned:
      return 'banned'
    case BanStatus.Unbanned:
      return 'unbanned'
    default:
      throw new Error(`Unknown publish status: ${banStatus}`)
  }
}

const getLabelForResolutionStatus = (
  resolutionStatus: ResolutionStatus
): string => {
  switch (resolutionStatus) {
    case ResolutionStatus.Pending:
      return 'unresolved'
    case ResolutionStatus.Resolved:
      return 'resolved'
    default:
      throw new Error(`Unknown publish status: ${resolutionStatus}`)
  }
}

const HistoryEntryLabel = ({
  entry: { message, data, parent, parenttable, createdby },
}: {
  entry: HistoryEntry
}) => {
  const changesWithoutMetafields: Partial<Asset> = data.changes
    ? Object.entries(data.changes).reduce(
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
    : {}

  switch (message) {
    case Message.Create:
      switch (parenttable) {
        case CommentsCollectionNames.Comments:
          return <>commented on</>
        case AssetsCollectionNames.Assets:
          return <>created the asset</>
        case AuthorsCollectionNames.Authors:
          return <>created the author</>
        default:
          return (
            <>created the {parenttable.substring(0, parenttable.length - 1)}*</>
          )
      }
    case Message.Edit:
      switch (parenttable) {
        case AssetsCollectionNames.Assets:
          return (
            <>
              changed{' '}
              {Object.keys(changesWithoutMetafields)
                .map((fieldName) =>
                  getLabelForAssetField(
                    fieldName as Extract<keyof Asset, string>
                  )
                )
                .join(', ')}
            </>
          )
        case AssetsCollectionNames.AssetsMeta:
          if ((data.changes as AssetMeta).approvalstatus) {
            return (
              <>
                {getLabelForApprovalStatus(
                  (data.changes as AssetMeta).approvalstatus!
                )}
              </>
            )
          } else if ((data.changes as AssetMeta).accessstatus) {
            return (
              <>
                {getLabelForAccessStatus(
                  (data.changes as AssetMeta).accessstatus!
                )}
              </>
            )
          } else if ((data.changes as AssetMeta).publishstatus) {
            return (
              <>
                {getLabelForPublishStatus(
                  (data.changes as AssetMeta).publishstatus!
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
          if (data.changes.banstatus) {
            return <>{getLabelForBanStatus(data.changes.banstatus)} user</>
          }
        case AuthorsCollectionNames.Authors:
          return <>edited author</>
        case ReportsCollectionNames.ReportsMeta:
          if ((data.changes as FullReport).resolutionstatus) {
            return (
              <>
                {getLabelForResolutionStatus(
                  (data.changes as FullReport).resolutionstatus
                )}{' '}
                report
              </>
            )
          } else if ((data.changes as FullReport).resolutionnotes) {
            return <>changed the resolution notes</>
          } else if ((data.changes as FullReport).editornotes) {
            return <>changed editor notes for report</>
          } else {
            return (
              <>changed {Object.keys(changesWithoutMetafields).join(', ')}</>
            )
          }
        case CommentsCollectionNames.CommentsMeta:
          if ((data.changes as MetaRecord).accessstatus) {
            return (
              <>
                {getLabelForAccessStatus(
                  (data.changes as MetaRecord).accessstatus!
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

export default HistoryEntryLabel
