import { CollectionNames as AssetsCollectionNames } from './assets'
import { CollectionNames as CommentsCollectionNames } from './comments'

const commonReportReasonKeys = {
  OFFENSIVE_CONTENT: 'OFFENSIVE_CONTENT',
  SPAM: 'SPAM',
  OTHER: 'OTHER',
}

export const reportReasonsKeysByCollection = {
  [AssetsCollectionNames.Assets]: {
    OUTDATED_CONTENT: 'OUTDATED_CONTENT',
    BROKEN_SOURCE: 'BROKEN_SOURCE',
    CLAIM_OWNERSHIP: 'CLAIM_OWNERSHIP',
    TAKEDOWN: 'TAKEDOWN',
  },
}

const commonReasons: ReportReason[] = [
  {
    value: commonReportReasonKeys.OFFENSIVE_CONTENT,
    label: 'Offensive content',
  },
  {
    value: commonReportReasonKeys.SPAM,
    label: 'Spam or bot message',
  },
  {
    value: commonReportReasonKeys.OTHER,
    label: 'Other/custom reason (use comments field)',
  },
]

const reasonsByCollectionName: { [collectionName: string]: ReportReason[] } = {
  [AssetsCollectionNames.Assets]: [
    {
      value:
        reportReasonsKeysByCollection[AssetsCollectionNames.Assets]
          .BROKEN_SOURCE,
      label: 'Broken or invalid source',
    },
    {
      value:
        reportReasonsKeysByCollection[AssetsCollectionNames.Assets]
          .OUTDATED_CONTENT,
      label:
        'Outdated content (eg. thumbnail, attachments, etc.). Please provide a link to the correct content',
    },
    {
      value:
        reportReasonsKeysByCollection[AssetsCollectionNames.Assets].TAKEDOWN,
      label:
        'I am the creator of this asset and I have read the takedown policy and want it to be taken down',
    },
  ],
  [CommentsCollectionNames.Comments]: [],
}

interface ReportReason {
  value: string
  label: string
}

export const getReasonsForCollectionName = (
  collectionName: string
): ReportReason[] => {
  const result = reasonsByCollectionName[collectionName]

  if (!result) {
    throw new Error(
      `Could not find valid reasons for collection "${collectionName}"`
    )
  }

  const withCommon = commonReasons.concat(result)

  return withCommon
}

export interface Report {
  id: string
  parenttable: string
  parent: string
  reason: string
  comments: string
  lastmodifiedat: Date
  lastmodifiedby: string
  createdat: Date
  createdby: string
}

export enum ResolutionStatus {
  Pending = 'pending',
  Resolved = 'resolved',
}

export interface ReportMeta extends Record<string, unknown> {
  editornotes: string
  resolutionstatus: ResolutionStatus
  resolvedat: Date
  resolvedby: string
  resolutionnotes: string
}

export interface FullReport extends Report, ReportMeta {
  parentdata: any
  createdbyusername: string
  resolvedbyusername: string
}

export enum CollectionNames {
  Reports = 'reports',
  // TODO: Pluralize this sometime
  ReportsMeta = 'reportmeta',
}

export enum ViewNames {
  GetFullReports = 'getfullreports',
}
