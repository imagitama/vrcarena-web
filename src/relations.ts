import {
  Amendment,
  CollectionNames as AmendmentsCollectionNames,
} from './modules/amendments'
import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from './modules/assets'
import {
  Author,
  CollectionNames as AuthorsCollectionNames,
} from './modules/authors'
import {
  Report,
  CollectionNames as ReportsCollectionNames,
} from './modules/reports'
import { CollectionNames as SpeciesCollectionNames } from './modules/species'
import { CollectionNames as SocialCollectionNames } from './modules/social'
import {
  Comment,
  CollectionNames as CommentsCollectionNames,
} from './modules/comments'
import { User, CollectionNames as UsersCollectionNames } from './modules/users'
import { Page, CollectionNames as PagesCollectionNames } from './modules/pages'
import {
  Review,
  CollectionNames as ReviewsCollectionNames,
} from './modules/reviews'
import * as routes from './routes'

const labelMaxLength = 100

export const getUrlForParent = (
  parentTable: string,
  parentId: string,
  parentData?: any,
  parentChildData?: any // if a meta record this could be the non-meta one
): string => {
  switch (parentTable) {
    case AssetsCollectionNames.Assets:
    case AssetsCollectionNames.AssetsMeta:
      return routes.viewAssetWithVar.replace(':assetId', parentId)
    case AuthorsCollectionNames.Authors:
      return routes.viewAssetWithVar.replace(':assetId', parentId)
    // TODO: Support comments on reports/amendments/users/etc
    case CommentsCollectionNames.Comments:
    case CommentsCollectionNames.CommentsMeta:
      return routes.viewAssetWithVarAndCommentVar
        .replace(
          ':assetId',
          parentChildData
            ? parentChildData.parent
            : parentData
            ? parentData.parent
            : 'NONE'
        )
        .replace(':commentId', parentId)
    case ReportsCollectionNames.Reports:
      return routes.viewReportWithVar.replace(':reportId', parentId)
    case UsersCollectionNames.Users:
    case UsersCollectionNames.UsersMeta:
    case UsersCollectionNames.UsersAdminMeta:
      return routes.viewUserWithVar.replace(':userId', parentId)
    case AmendmentsCollectionNames.Amendments:
    case AmendmentsCollectionNames.AmendmentsMeta:
      return routes.viewAmendmentWithVar.replace(':amendmentId', parentId)
    case PagesCollectionNames.Pages:
      return routes.pagesWithParentAndPageVar
        .replace(':parentName', parentData.parent)
        .replace(':pageName', parentData.id)
    case ReportsCollectionNames.Reports:
    case ReportsCollectionNames.ReportsMeta:
      return routes.viewReportWithVar.replace(':reportId', parentId)
    case SpeciesCollectionNames.Species:
      return routes.viewSpeciesWithVar.replace(':speciesIdOrSlug', parentId)
    case SocialCollectionNames.SocialPostMeta:
      return routes.socialWithPostVar.replace(':postId', parentData.id)
    case ReviewsCollectionNames.Reviews:
      return routes.viewReviewWithVar.replace(':reviewId', parentData.id)
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
    case AssetsCollectionNames.Assets:
      return (parentData as Asset).title || '(no title)'
    case AssetsCollectionNames.AssetsMeta:
      if (parentChildData) {
        return (parentChildData as Asset).title
      } else {
        return `asset`
      }
    case AuthorsCollectionNames.Authors:
      return (parentData as Author).name || '(no name)'
    case UsersCollectionNames.Users:
      return (parentData as User).username || '(no username)'
    case ReportsCollectionNames.Reports:
      return (parentData as Report).reason
        ? (parentData as Report).reason.substring(0, labelMaxLength)
        : '(no report reason)'
    case AmendmentsCollectionNames.AmendmentsMeta:
      if (parentChildData) {
        return `${(parentChildData as Amendment).parenttable} amendment`
      } else {
        return `amendment`
      }
    case PagesCollectionNames.Pages:
      return (parentData as Page).title
    case CommentsCollectionNames.CommentsMeta:
      if (parentChildData) {
        return (
          (parentChildData as Comment).comment.substring(0, labelMaxLength) ||
          '(no comment data)'
        )
      }
    case ReportsCollectionNames.ReportsMeta:
      if (parentChildData) {
        return (parentChildData as Report).reason
          ? (parentChildData as Report).reason.substring(0, labelMaxLength)
          : '(no report reason)'
      }
    case SocialCollectionNames.SocialPostMeta:
      if (parentChildData) {
        return parentChildData.text.substring(0, labelMaxLength)
      }
    default:
      throw new Error(
        `Could not get label for parent ${parentTable} - not supported`
      )
  }
}
