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
import { CollectionNames as CommentsCollectionNames } from './modules/comments'
import { FullNotification } from './modules/notifications'

export enum NotificationEvent {
  ASSET_APPROVED = 'ASSET_APPROVED',
  ASSET_UNAPPROVED = 'ASSET_UNAPPROVED',
  ASSET_DELETED = 'ASSET_DELETED',
  ASSET_AMENDED = 'ASSET_AMENDED',
  COMMENT_ON_ASSET = 'COMMENT_ON_ASSET',
  COMMENT_ON_USER = 'COMMENT_ON_USER',
  COMMENT_ON_ASSET_AMENDMENT = 'COMMENT_ON_ASSET_AMENDMENT',
  COMMENT_ON_REPORT = 'COMMENT_ON_REPORT',
  TAGGED_IN_COMMENT = 'TAGGED_IN_COMMENT',
  ASSET_NEEDS_APPROVAL = 'ASSET_NEEDS_APPROVAL',
  REPORT_CREATED = 'REPORT_CREATED',
  AWARD_GIVEN = 'AWARD_GIVEN',
  PRIVATE_MESSAGE_RECEIVED = 'PRIVATE_MESSAGE_RECEIVED',
  ASSET_OWNERSHIP_CHANGED = 'ASSET_OWNERSHIP_CHANGED',
  ASSET_AMENDMENT_APPROVED = 'ASSET_AMENDMENT_APPROVED', // TODO: remove prefix
  ASSET_AMENDMENT_REJECTED = 'ASSET_AMENDMENT_REJECTED', // TODO: remove prefix
  DIGEST = 'DIGEST',
  SUBSCRIPTION_ALERT = 'SUBSCRIPTION_ALERT',
  REPORT_RESOLUTION_CHANGED = 'REPORT_RESOLUTION_CHANGED',
  REP_AWARDED = 'REP_AWARDED', // only if repreason.shouldnotify=true (sent by SQL trigger)
  USER_CHANGED = 'USER_CHANGED', // banned, role change, etc.
  EVENT_APPROVED = 'EVENT_APPROVED',
  EVENT_FEATURED = 'EVENT_FEATURED',
}

// values are all-caps from legacy code
export enum NotificationMethod {
  Web = 'WEB',
  Email = 'EMAIL',
  Discord = 'DISCORD', // not used
}

export const defaultNotificationPrefs = {
  events: {
    [NotificationEvent.ASSET_APPROVED]: true,
    [NotificationEvent.ASSET_UNAPPROVED]: true,
    [NotificationEvent.ASSET_DELETED]: true,
    [NotificationEvent.ASSET_AMENDED]: true,
    [NotificationEvent.COMMENT_ON_ASSET]: true,
    [NotificationEvent.COMMENT_ON_USER]: true,
    [NotificationEvent.COMMENT_ON_ASSET_AMENDMENT]: true, // TODO: make generic event for commenting
    [NotificationEvent.COMMENT_ON_REPORT]: true, // TODO: make generic event for commenting
    [NotificationEvent.TAGGED_IN_COMMENT]: true,
    [NotificationEvent.AWARD_GIVEN]: true,
    [NotificationEvent.PRIVATE_MESSAGE_RECEIVED]: true,
    [NotificationEvent.ASSET_OWNERSHIP_CHANGED]: true,
    [NotificationEvent.ASSET_AMENDMENT_APPROVED]: true,
    [NotificationEvent.ASSET_AMENDMENT_REJECTED]: true,
    [NotificationEvent.DIGEST]: false,
    [NotificationEvent.SUBSCRIPTION_ALERT]: true,
    [NotificationEvent.REPORT_RESOLUTION_CHANGED]: true, // shared with support tickets
    [NotificationEvent.REP_AWARDED]: true, // only if repreason.shouldnotify=true (sent by SQL trigger)

    [NotificationEvent.USER_CHANGED]: true,
    [NotificationEvent.EVENT_APPROVED]: true,
    [NotificationEvent.EVENT_FEATURED]: true,

    // editors only
    [NotificationEvent.ASSET_NEEDS_APPROVAL]: true,
    [NotificationEvent.REPORT_CREATED]: true,
  },
  methods: {
    [NotificationMethod.Web]: true,
    [NotificationMethod.Email]: true,
    [NotificationMethod.Discord]: true,
  },
}

export const getLabelForNotification = ({
  parentdata: parentData,
  parenttable: collectionName,
  event,
  message,
  data,
}: FullNotification<any, any>) => {
  if (message) return message

  // I screwed up the message field so temporary thing until those notifications are purged
  if (event.indexOf('has created an amendment for your asset') !== -1) {
    return event
  }

  switch (event) {
    case NotificationEvent.ASSET_APPROVED:
    case 'Approved asset':
      return `Your asset "${
        data && data.asset && (data.asset as Asset).title
          ? (data.asset as Asset).title
          : 'Unknown'
      }" was approved`
    case NotificationEvent.COMMENT_ON_ASSET_AMENDMENT:
      return `${
        (data && data.author && data.author.username) || 'Someone'
      } commented on your amendment`
    case NotificationEvent.COMMENT_ON_ASSET:
      return `${
        (data && data.author && data.author.username) || 'Someone'
      } commented on asset "${
        (parentData as Asset).title ? (parentData as Asset).title : 'Unknown'
      }"`
    case NotificationEvent.COMMENT_ON_USER:
      return `${
        (data && data.author && data.author.username) || 'Someone'
      } commented on your profile`
    case NotificationEvent.TAGGED_IN_COMMENT:
      switch (collectionName) {
        case AssetsCollectionNames.Assets:
          return `${
            (data && data.author && (data.author as User).username) || 'Someone'
          } tagged you in a comment of asset "${
            (parentData as Asset).title
              ? (parentData as Asset).title
              : 'Unknown'
          }"`
        case UsersCollectionNames.Users:
          return `${
            (data && data.author && (data.author as User).username) || 'Someone'
          } tagged you in a comment for user ${
            (parentData as User).username
              ? (parentData as User).username
              : 'Unknown'
          }`
        case AmendmentsCollectionNames.Amendments:
          return `${
            (data && data.author && (data.author as Author).username) ||
            'Someone'
          } tagged you in a comment for an amendment`
        default:
          return `${
            (data && data.author && (data.author as Author).username) ||
            'Someone'
          } tagged you in a comment`
      }
    case NotificationEvent.ASSET_AMENDED:
      return `User "${
        data && data.creator && (data.creator as User).username
          ? (data.creator as User).username
          : 'Someone'
      }" amended the item "${
        data && data.asset && (data.asset as Asset).title
          ? (data.asset as Asset).title
          : 'unknown'
      }"`
    case NotificationEvent.ASSET_AMENDMENT_APPROVED:
      return `Your amendment has been approved`
    case NotificationEvent.ASSET_AMENDMENT_REJECTED:
      return `Your amendment has been rejected`
    case NotificationEvent.ASSET_NEEDS_APPROVAL:
      return `Asset needs approval`
    case NotificationEvent.ASSET_UNAPPROVED:
      return `Asset has not been approved (and is marked as unpublished) and it may require your input`
    case NotificationEvent.ASSET_DELETED:
      return `Your asset has been deleted`
    case NotificationEvent.REPORT_CREATED:
      return 'Report created'
    case NotificationEvent.AWARD_GIVEN:
      return `You have been given the award "${getNameForAwardId(
        data.awardId
      )}"!`
    case NotificationEvent.ASSET_OWNERSHIP_CHANGED:
      return `You are now the owner of "${
        (parentData as Asset).title ? (parentData as Asset).title : 'Unknown'
      }"`
    case NotificationEvent.SUBSCRIPTION_ALERT:
      return `Subscription alert: ${getSubscriptionMessage(
        data.topic,
        data.extraData
      )}`
    case NotificationEvent.REPORT_RESOLUTION_CHANGED:
      return `Your report has been updated`
    case NotificationEvent.REP_AWARDED:
      return 'You gain reputation'
    case NotificationEvent.USER_CHANGED:
      return 'Your account has been changed (eg. banned, role changed)'
    case NotificationEvent.EVENT_APPROVED:
      return 'Your event has been approved'
    case NotificationEvent.EVENT_FEATURED:
      return 'Your event has been featured'
    default:
      console.log(`Unknown event for notification: ` + event)
      return `Event: ${event}`
  }
}

export const getLinkUrl = ({
  parent: parentId,
  parenttable: collectionName,
  event,
  data,
}: FullNotification<any, any>): string | undefined => {
  const userId = getUserId()
  let actualParentId
  switch (event) {
    case NotificationEvent.REPORT_CREATED:
    case NotificationEvent.REPORT_RESOLUTION_CHANGED:
      return routes.viewReportWithVar.replace(':reportId', parentId)
    case NotificationEvent.AWARD_GIVEN:
      return routes.viewUserWithVar.replace(':userId', userId || '')
    case NotificationEvent.ASSET_AMENDED:
    case NotificationEvent.ASSET_AMENDMENT_APPROVED:
    case NotificationEvent.ASSET_AMENDMENT_REJECTED:
      return routes.viewAmendmentWithVar.replace(':amendmentId', parentId)
    case NotificationEvent.SUBSCRIPTION_ALERT:
      if (data) {
        return getRouteForTopic(data.topic, parentId, data.extraData)
      } else {
        return '/#no-data'
      }
    case NotificationEvent.COMMENT_ON_ASSET:
    case NotificationEvent.TAGGED_IN_COMMENT:
      const commentOrSocialPostId = parentId
      const commentOrSocialPostCollectionName = collectionName

      switch (commentOrSocialPostCollectionName) {
        case SocialCollectionNames.SocialPosts:
          actualParentId = data.parent
          return routes.socialWithPostVar.replace(':postId', actualParentId)
        case CommentsCollectionNames.Comments:
          const actualParentCollectionName = data.parentType
          actualParentId = data.parent

          switch (actualParentCollectionName) {
            case AssetsCollectionNames.Assets:
              return routes.viewAssetWithVarAndCommentVar
                .replace(':assetId', actualParentId)
                .replace(':commentId', commentOrSocialPostId)
            case UsersCollectionNames.Users:
              return routes.viewUserWithVar.replace(':userId', actualParentId)
            case AmendmentsCollectionNames.Amendments:
              return routes.viewAmendmentWithVar.replace(
                ':userId',
                actualParentId
              )
            case ReportsCollectionNames.Reports:
              return routes.viewReportWithVar.replace(
                ':reportId',
                actualParentId
              )
            default:
              return `/#unknown-collection-${actualParentCollectionName}`
          }
      }
    case NotificationEvent.COMMENT_ON_ASSET_AMENDMENT:
      return routes.viewAmendmentWithVar.replace(':amendmentId', parentId)
    case NotificationEvent.COMMENT_ON_REPORT:
      return routes.viewReportWithVar.replace(':reportId', parentId)
    case NotificationEvent.REP_AWARDED:
      return routes.myAccountWithTabNameVar.replace(':tabName', 'reputation')
  }

  switch (collectionName) {
    case AssetsCollectionNames.Assets:
      return routes.viewAssetWithVar.replace(':assetId', parentId)
    case UsersCollectionNames.Users:
      return routes.viewUserWithVar.replace(':userId', parentId)
  }
}
