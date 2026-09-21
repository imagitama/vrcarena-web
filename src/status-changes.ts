import {
  AccessStatus,
  ApprovalStatus,
  PublishStatus,
  ResolutionStatus,
} from './modules/common'
import { BanStatus } from './modules/users'

export const getLabelForApprovalStatus = (approvalStatus: string): string => {
  switch (approvalStatus) {
    case ApprovalStatus.Approved:
      return 'approved'
    case ApprovalStatus.Declined:
      return 'declined'
    case ApprovalStatus.Waiting:
      return 'reverted back to waiting'
    case ApprovalStatus.Quarantined:
      return 'quarantined'
    case ApprovalStatus.AutoApproved:
      return 'auto-approved'
    default:
      throw new Error(`Unknown approval status: ${approvalStatus}`)
  }
}

export const getLabelForAccessStatus = (accessStatus: string): string => {
  switch (accessStatus) {
    case AccessStatus.Deleted:
      return 'moved to trash'
    case AccessStatus.Public:
      return 'moved out of trash'
    default:
      throw new Error(`Unknown access status: ${accessStatus}`)
  }
}

export const getLabelForPublishStatus = (publishStatus: string): string => {
  switch (publishStatus) {
    case PublishStatus.Draft:
      return 'moved back to draft'
    case PublishStatus.Published:
      return 'published for approval'
    default:
      throw new Error(`Unknown publish status: ${publishStatus}`)
  }
}

export const getLabelForBanStatus = (banStatus: string): string => {
  switch (banStatus) {
    case BanStatus.Banned:
      return 'banned'
    case BanStatus.Unbanned:
      return 'unbanned'
    default:
      throw new Error(`Unknown publish status: ${banStatus}`)
  }
}

export const getLabelForResolutionStatus = (
  resolutionStatus: string
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
