import { getNameForAwardId } from './awards'
import { getRouteForTopic, getSubscriptionMessage } from './subscriptions'
import * as routes from './routes'
import { getUserId } from './supabase'
import { CollectionNames as SocialCollectionNames } from './modules/social'
import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from './modules/assets'
import { Author } from './modules/authors'
import { User, CollectionNames as UsersCollectionNames } from './modules/users'
import { CollectionNames as AmendmentsCollectionNames } from './modules/amendments'
import { CollectionNames as ReportsCollectionNames } from './modules/reports'
import { CollectionNames as SpeciesCollectionNames } from './modules/species'
import { CollectionNames as AuthorsCollectionNames } from './modules/authors'
import { CollectionNames as CommentsCollectionNames } from './modules/comments'
import { CollectionNames as WishlistsCollectionNames } from './modules/wishlists'
import { CollectionNames as AttachmentsCollectionNames } from './modules/attachments'
import { HistoryEntry, Message } from './modules/history'

export const getMessageLabel = ({ message }: HistoryEntry) => {
  switch (message) {
    case Message.Create:
      return 'Created'
    case Message.Edit:
      return 'Edited'
    default:
      return message
  }
}

// export const getParentLabel = ({
//   parenttable: parentTable,
//   parent: parentId,
// }: HistoryEntry) => {
//   switch (parentTable) {
//     case AssetsCollectionNames.Assets:
//       return 'asset'
//     case AssetsCollectionNames.AssetsMeta:
//       return 'asset metadata'

//     case CommentsCollectionNames.Comments:
//       return 'comment'
//     case CommentsCollectionNames.CommentsMeta:
//       return 'comment metadata'

//     case AuthorsCollectionNames.Authors:
//       return 'author'
//     case AuthorsCollectionNames.AuthorsMeta:
//       return 'author metadata'

//     case UsersCollectionNames.Users:
//       return 'user'
//     case UsersCollectionNames.UsersMeta:
//       return 'user metadata'
//     case UsersCollectionNames.UsersAdminMeta:
//       return 'user admin metadata'

//     case AttachmentsCollectionNames.Attachments:
//       return 'attachment'
//     case AttachmentsCollectionNames.AttachmentsMeta:
//       return 'attachment metadata'

//     case WishlistsCollectionNames.WishlistsForUsers:
//       return 'wishlist'

//     case SpeciesCollectionNames.Species:
//       return 'comment'
//     // case SpeciesCollectionNames.SpeciesMeta:
//     //   return 'comment metadata'

//     default:
//       return `Parent: ${parentTable}.${parentId}`

//     // return routes.viewAmendmentWithVar.replace(':amendmentId', parentId)
//   }
// }

//   switch (message) {
//     case NotificationEvents.ASSET_APPROVED:
//     case 'Approved asset':
//       return `Your asset "${
//         data && data.asset && (data.asset as Asset).title
//           ? (data.asset as Asset).title
//           : 'Unknown'
//       }" was approved`
//     case NotificationEvents.COMMENT_ON_ASSET_AMENDMENT:
//       return `${
//         (data && data.author && data.author.username) || 'Someone'
//       } commented on your amendment`
//     case NotificationEvents.COMMENT_ON_ASSET:
//       return `${
//         (data && data.author && data.author.username) || 'Someone'
//       } commented on asset "${
//         (parentData as Asset).title ? (parentData as Asset).title : 'Unknown'
//       }"`
//     case NotificationEvents.COMMENT_ON_USER:
//       return `${
//         (data && data.author && data.author.username) || 'Someone'
//       } commented on your profile`
//     case NotificationEvents.TAGGED_IN_COMMENT:
//       switch (collectionName) {
//         case AssetsCollectionNames.Assets:
//           return `${
//             (data && data.author && (data.author as User).username) || 'Someone'
//           } tagged you in a comment of asset "${
//             (parentData as Asset).title
//               ? (parentData as Asset).title
//               : 'Unknown'
//           }"`
//         case UsersCollectionNames.Users:
//           return `${
//             (data && data.author && (data.author as User).username) || 'Someone'
//           } tagged you in a comment for user ${
//             (parentData as User).username
//               ? (parentData as User).username
//               : 'Unknown'
//           }`
//         case AmendmentsCollectionNames.Amendments:
//           return `${
//             (data && data.author && (data.author as Author).username) ||
//             'Someone'
//           } tagged you in a comment for an amendment`
//         default:
//           return `${
//             (data && data.author && (data.author as Author).username) ||
//             'Someone'
//           } tagged you in a comment`
//       }
//     case NotificationEvents.ASSET_AMENDED:
//       return `User "${
//         data && data.creator && (data.creator as User).username
//           ? (data.creator as User).username
//           : 'Someone'
//       }" amended the item "${
//         data && data.asset && (data.asset as Asset).title
//           ? (data.asset as Asset).title
//           : 'unknown'
//       }"`
//     case NotificationEvents.ASSET_AMENDMENT_APPROVED:
//       return `Your amendment has been approved`
//     case NotificationEvents.ASSET_AMENDMENT_REJECTED:
//       return `Your amendment has been rejected`
//     case NotificationEvents.ASSET_NEEDS_APPROVAL:
//       return `Asset needs approval`
//     case NotificationEvents.ASSET_UNAPPROVED:
//       return `Asset has not been approved (and is marked as unpublished) and it may require your input`
//     case NotificationEvents.ASSET_DELETED:
//       return `Your asset has been deleted`
//     case NotificationEvents.REPORT_CREATED:
//       return 'Report created'
//     case NotificationEvents.AWARD_GIVEN:
//       return `You have been given the award "${getNameForAwardId(
//         data.awardId
//       )}"!`
//     case NotificationEvents.ASSET_OWNERSHIP_CHANGED:
//       return `You are now the owner of "${
//         (parentData as Asset).title ? (parentData as Asset).title : 'Unknown'
//       }"`
//     case NotificationEvents.SUBSCRIPTION_ALERT:
//       return `Subscription alert: ${getSubscriptionMessage(
//         data.topic,
//         data.extraData
//       )}`
//     case NotificationEvents.REPORT_RESOLUTION_CHANGED:
//       return `Your report has been updated`
//     default:
//       console.log(`Unknown message for notification: ` + message)
//       return `Unknown message: ${message}`
//   }

export const getLinkUrl = ({
  message,
  parent: parentId,
  parenttable: parentTable,
}: HistoryEntry) => {
  const userId = getUserId()
  let actualParentId

  // switch (message) {
  //   case Message.Create:
  //     return 'Created'
  //   case Message.Edit:
  //     return 'Edited'
  //   default:
  //     return message
  // }

  switch (parentTable) {
    case AssetsCollectionNames.Assets:
    case AssetsCollectionNames.AssetsMeta:
      return routes.viewAssetWithVarAndCommentVar.replace(':assetId', parentId)

    default:
      return `Parent: ${parentTable}`

    // return routes.viewAmendmentWithVar.replace(':amendmentId', parentId)
  }

  //   switch (message) {
  //     case NotificationEvents.REPORT_CREATED:
  //     case NotificationEvents.REPORT_RESOLUTION_CHANGED:
  //       return routes.viewReportWithVar.replace(':reportId', parentId)
  //     case NotificationEvents.AWARD_GIVEN:
  //       return routes.viewUserWithVar.replace(':userId', userId || '')
  //     case NotificationEvents.ASSET_AMENDED:
  //     case NotificationEvents.ASSET_AMENDMENT_APPROVED:
  //     case NotificationEvents.ASSET_AMENDMENT_REJECTED:
  //       return routes.viewAmendmentWithVar.replace(':amendmentId', parentId)
  //     case NotificationEvents.SUBSCRIPTION_ALERT:
  //       if (data) {
  //         return getRouteForTopic(data.topic, parentId, data.extraData)
  //       } else {
  //         return '/#no-data'
  //       }
  //     case NotificationEvents.COMMENT_ON_ASSET:
  //     case NotificationEvents.TAGGED_IN_COMMENT:
  //       const commentOrSocialPostId = parentId
  //       const commentOrSocialPostCollectionName = collectionName

  //       switch (commentOrSocialPostCollectionName) {
  //         case SocialCollectionNames.SocialPosts:
  //           actualParentId = data.parent
  //           return routes.socialWithPostVar.replace(':postId', actualParentId)
  //         case CommentsCollectionNames.Comments:
  //           const actualParentCollectionName = data.parentType
  //           actualParentId = data.parent

  //           switch (actualParentCollectionName) {
  //             case AssetsCollectionNames.Assets:
  //               return routes.viewAssetWithVarAndCommentVar
  //                 .replace(':assetId', actualParentId)
  //                 .replace(':commentId', commentOrSocialPostId)
  //             case UsersCollectionNames.Users:
  //               return routes.viewUserWithVar.replace(':userId', actualParentId)
  //             case AmendmentsCollectionNames.Amendments:
  //               return routes.viewAmendmentWithVar.replace(
  //                 ':userId',
  //                 actualParentId
  //               )
  //             case ReportsCollectionNames.Reports:
  //               return routes.viewReportWithVar.replace(
  //                 ':reportId',
  //                 actualParentId
  //               )
  //             default:
  //               return `/#unknown-collection-${actualParentCollectionName}`
  //           }
  //       }
  //     case NotificationEvents.COMMENT_ON_ASSET_AMENDMENT:
  //       return routes.viewAmendmentWithVar.replace(':amendmentId', parentId)
  //     case NotificationEvents.COMMENT_ON_REPORT:
  //       return routes.viewReportWithVar.replace(':reportId', parentId)
  //   }

  //   switch (collectionName) {
  //     case AssetsCollectionNames.Assets:
  //       return routes.viewAssetWithVar.replace(':assetId', parentId)
  //     case UsersCollectionNames.Users:
  //       return routes.viewUserWithVar.replace(':userId', parentId)
  //     default:
  //       return `/#unknown-message-${message}`
  //   }
}
