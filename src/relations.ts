import { CollectionNames, PagesFieldNames } from './data-store'
import {
  AssetFieldNames,
  AuthorFieldNames,
  CollectionNames as OldCollectionNames,
  CommentFieldNames,
  PatreonStatuses,
  ReportFieldNames,
  UserFieldNames,
  UserRoles
} from './hooks/useDatabaseQuery'
import * as routes from './routes'
import { AmendmentsFieldNames } from './modules/amendments'
import { CollectionNames as ReportsCollectionNames } from './modules/reports'

const labelMaxLength = 100

export const getUrlForParent = (
  parentTable: string,
  parentId: string,
  parentData?: any,
  parentChildData?: any // if a meta record this could be the non-meta one
): string => {
  switch (parentTable) {
    case OldCollectionNames.Assets:
    case OldCollectionNames.AssetMeta:
      return routes.viewAssetWithVar.replace(':assetId', parentId)
    case OldCollectionNames.Authors:
      return routes.viewAssetWithVar.replace(':assetId', parentId)
    // TODO: Support comments on amendments/users/etc
    case OldCollectionNames.Comments:
    case CollectionNames.CommentsMeta:
      return routes.viewAssetWithVarAndCommentVar
        .replace(
          ':assetId',
          parentChildData ? parentChildData.parent : parentData.parent
        )
        .replace(':commentId', parentId)
    case OldCollectionNames.Reports:
      return routes.viewReportWithVar.replace(':reportId', parentId)
    case OldCollectionNames.Users:
    case OldCollectionNames.UserMeta:
    case OldCollectionNames.UserAdminMeta:
      return routes.viewUserWithVar.replace(':userId', parentId)
    case CollectionNames.Amendments:
    case CollectionNames.AmendmentsMeta:
      return routes.viewAmendmentWithVar.replace(':amendmentId', parentId)
    case CollectionNames.Pages:
      return routes.pagesWithParentAndPageVar
        .replace(':parentName', parentData.parent)
        .replace(':pageName', parentData.id)
    case ReportsCollectionNames.Reports:
    case ReportsCollectionNames.ReportsMeta:
      return routes.viewReportWithVar.replace(':reportId', parentId)
    default:
      throw new Error(
        `Could not get URL for parent ${parentTable} - not supported`
      )
  }
}

export const getLabelForParent = (
  parentTable: string,
  parentData: any,
  parentChildData?: any // if a meta record this could be the non-meta one
): string => {
  switch (parentTable) {
    case OldCollectionNames.Assets:
      return parentData[AssetFieldNames.title] || '(no title)'
    case OldCollectionNames.AssetMeta:
      if (parentChildData) {
        return parentChildData[AssetFieldNames.title]
      } else {
        return `asset`
      }
    case OldCollectionNames.Authors:
      return parentData[AuthorFieldNames.name] || '(no name)'
    case OldCollectionNames.Users:
      return parentData[UserFieldNames.username] || '(no username)'
    case OldCollectionNames.Reports:
      return (
        parentData[ReportFieldNames.reason.substring(0, labelMaxLength)] ||
        '(no report reason)'
      )
    case CollectionNames.AmendmentsMeta:
      if (parentChildData) {
        return `${parentChildData[AmendmentsFieldNames.parentTable]} amendment`
      } else {
        return `amendment`
      }
    case CollectionNames.Pages:
      return parentData[PagesFieldNames.title]
    case CollectionNames.CommentsMeta:
      if (parentChildData) {
        return (
          parentChildData[CommentFieldNames.comment].substring(
            0,
            labelMaxLength
          ) || '(no comment data)'
        )
      }
    case ReportsCollectionNames.ReportsMeta:
      if (parentChildData) {
        return (
          parentChildData[ReportFieldNames.reason].substring(
            0,
            labelMaxLength
          ) || '(no report reason)'
        )
      }
    default:
      throw new Error(
        `Could not get label for parent ${parentTable} - not supported`
      )
  }
}
