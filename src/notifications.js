import { getNameForAwardId } from './awards'
import {
  AssetFieldNames,
  CollectionNames,
  UserFieldNames,
} from './hooks/useDatabaseQuery'
import { getRouteForTopic, getSubscriptionMessage } from './subscriptions'
import * as routes from './routes'
import { getUserId } from './supabase'
import { CollectionNames as SocialCollectionNames } from './modules/social'

export const NotificationEvents = {
  ASSET_APPROVED: 'ASSET_APPROVED',
  ASSET_UNAPPROVED: 'ASSET_UNAPPROVED',
  ASSET_DELETED: 'ASSET_DELETED',
  ASSET_AMENDED: 'ASSET_AMENDED',
  COMMENT_ON_ASSET: 'COMMENT_ON_ASSET',
  COMMENT_ON_USER: 'COMMENT_ON_USER',
  COMMENT_ON_ASSET_AMENDMENT: 'COMMENT_ON_ASSET_AMENDMENT',
  COMMENT_ON_REPORT: 'COMMENT_ON_REPORT',
  TAGGED_IN_COMMENT: 'TAGGED_IN_COMMENT',
  ASSET_NEEDS_APPROVAL: 'ASSET_NEEDS_APPROVAL',
  REPORT_CREATED: 'REPORT_CREATED',
  AWARD_GIVEN: 'AWARD_GIVEN',
  PRIVATE_MESSAGE_RECEIVED: 'PRIVATE_MESSAGE_RECEIVED',
  ASSET_OWNERSHIP_CHANGED: 'ASSET_OWNERSHIP_CHANGED',
  ASSET_AMENDMENT_APPROVED: 'ASSET_AMENDMENT_APPROVED',
  ASSET_AMENDMENT_REJECTED: 'ASSET_AMENDMENT_REJECTED',
  DIGEST: 'DIGEST',
  SUBSCRIPTION_ALERT: 'SUBSCRIPTION_ALERT',
  REPORT_RESOLUTION_CHANGED: 'REPORT_RESOLUTION_CHANGED',
}

export const NotificationMethods = {
  WEB: 'WEB',
  EMAIL: 'EMAIL',
  DISCORD: 'DISCORD',
}

export const defaultNotificationPrefs = {
  events: {
    [NotificationEvents.ASSET_APPROVED]: true,
    [NotificationEvents.ASSET_UNAPPROVED]: true,
    [NotificationEvents.ASSET_DELETED]: true,
    [NotificationEvents.ASSET_AMENDED]: true,
    [NotificationEvents.COMMENT_ON_ASSET]: true,
    [NotificationEvents.COMMENT_ON_USER]: true,
    [NotificationEvents.COMMENT_ON_ASSET_AMENDMENT]: true, // TODO: make generic event for commenting
    [NotificationEvents.COMMENT_ON_REPORT]: true, // TODO: make generic event for commenting
    [NotificationEvents.TAGGED_IN_COMMENT]: true,
    [NotificationEvents.AWARD_GIVEN]: true,
    [NotificationEvents.PRIVATE_MESSAGE_RECEIVED]: true,
    [NotificationEvents.ASSET_OWNERSHIP_CHANGED]: true,
    [NotificationEvents.ASSET_AMENDMENT_APPROVED]: true,
    [NotificationEvents.ASSET_AMENDMENT_REJECTED]: true,
    [NotificationEvents.DIGEST]: false,
    [NotificationEvents.SUBSCRIPTION_ALERT]: true,
    [NotificationEvents.REPORT_RESOLUTION_CHANGED]: true,

    // editors only
    [NotificationEvents.ASSET_NEEDS_APPROVAL]: true,
    [NotificationEvents.REPORT_CREATED]: true,
  },
  methods: {
    [NotificationMethods.WEB]: true,
    [NotificationMethods.EMAIL]: true,
    [NotificationMethods.DISCORD]: true,
  },
}

export const getLabelForNotification = ({
  parentdata: parentData,
  parenttable: collectionName,
  message,
  data,
}) => {
  // I screwed up the message field so temporary thing until those notifications are purged
  if (message.indexOf('has created an amendment for your asset') !== -1) {
    return message
  }

  switch (message) {
    case NotificationEvents.ASSET_APPROVED:
    case 'Approved asset':
      return `Your asset "${
        data && data.asset && data.asset[AssetFieldNames.title]
          ? data.asset[AssetFieldNames.title]
          : 'Unknown'
      }" was approved`
    case NotificationEvents.COMMENT_ON_ASSET_AMENDMENT:
      return `${
        (data && data.author && data.author.username) || 'Someone'
      } commented on your amendment`
    case NotificationEvents.COMMENT_ON_ASSET:
      return `${
        (data && data.author && data.author.username) || 'Someone'
      } commented on asset "${
        parentData[AssetFieldNames.title]
          ? parentData[AssetFieldNames.title]
          : 'Unknown'
      }"`
    case NotificationEvents.COMMENT_ON_USER:
      return `${
        (data && data.author && data.author.username) || 'Someone'
      } commented on your profile`
    case NotificationEvents.TAGGED_IN_COMMENT:
      switch (collectionName) {
        case CollectionNames.Assets:
          return `${
            (data && data.author && data.author[UserFieldNames.username]) ||
            'Someone'
          } tagged you in a comment of asset "${
            parentData[AssetFieldNames.title]
              ? parentData[AssetFieldNames.title]
              : 'Unknown'
          }"`
        case CollectionNames.Users:
          return `${
            (data && data.author && data.author[UserFieldNames.username]) ||
            'Someone'
          } tagged you in a comment for user ${
            parentData[UserFieldNames.username]
              ? parentData[UserFieldNames.username]
              : 'Unknown'
          }`
        case CollectionNames.AssetAmendments:
          return `${
            (data && data.author && data.author[UserFieldNames.username]) ||
            'Someone'
          } tagged you in a comment for an asset amendment`
        default:
          return `${
            (data && data.author && data.author[UserFieldNames.username]) ||
            'Someone'
          } tagged you in a comment`
      }
    case NotificationEvents.ASSET_AMENDED:
      return `User "${
        data && data.creator && data.creator[UserFieldNames.username]
          ? data.creator[UserFieldNames.username]
          : 'Someone'
      }" amended the item "${
        data && data.asset && data.asset[AssetFieldNames.title]
          ? data.asset[AssetFieldNames.title]
          : 'unknown'
      }"`
    case NotificationEvents.ASSET_AMENDMENT_APPROVED:
      return `Your amendment has been approved`
    case NotificationEvents.ASSET_AMENDMENT_REJECTED:
      return `Your amendment has been rejected`
    case NotificationEvents.ASSET_NEEDS_APPROVAL:
      return `Asset needs approval`
    case NotificationEvents.ASSET_UNAPPROVED:
      return `Asset has not been approved (and is marked as unpublished) and it may require your input`
    case NotificationEvents.ASSET_DELETED:
      return `Your asset has been deleted`
    case NotificationEvents.REPORT_CREATED:
      return 'Report created'
    case NotificationEvents.AWARD_GIVEN:
      return `You have been given the award "${getNameForAwardId(
        data.awardId
      )}"!`
    case NotificationEvents.ASSET_OWNERSHIP_CHANGED:
      return `You are now the owner of "${
        parentData[AssetFieldNames.title]
          ? parentData[AssetFieldNames.title]
          : 'Unknown'
      }"`
    case NotificationEvents.SUBSCRIPTION_ALERT:
      return `Subscription alert: ${getSubscriptionMessage(
        data.topic,
        data.extraData
      )}`
    case NotificationEvents.REPORT_RESOLUTION_CHANGED:
      return `Your report has been updated`
    default:
      console.log(`Unknown message for notification: ` + message)
      return `Unknown message: ${message}`
  }
}

export const getLinkUrl = ({
  parent: parentId,
  parenttable: collectionName,
  message,
  data,
}) => {
  const userId = getUserId()
  switch (message) {
    case NotificationEvents.REPORT_CREATED:
    case NotificationEvents.REPORT_RESOLUTION_CHANGED:
      return routes.viewReportWithVar.replace(':reportId', parentId)
    case NotificationEvents.AWARD_GIVEN:
      return routes.viewUserWithVar.replace(':userId', userId)
    case NotificationEvents.ASSET_AMENDED:
    case NotificationEvents.ASSET_AMENDMENT_APPROVED:
    case NotificationEvents.ASSET_AMENDMENT_REJECTED:
      return routes.viewAmendmentWithVar.replace(':amendmentId', parentId)
    case NotificationEvents.SUBSCRIPTION_ALERT:
      if (data) {
        return getRouteForTopic(data.topic, parentId, data.extraData)
      } else {
        return '/#no-data'
      }
    case NotificationEvents.COMMENT_ON_ASSET:
    case NotificationEvents.TAGGED_IN_COMMENT:
      const commentOrSocialPostId = parentId
      const commentOrSocialPostCollectionName = collectionName

      switch (commentOrSocialPostCollectionName) {
        case SocialCollectionNames.SocialPosts:
          return routes.socialWithPostVar.replace(':postId', actualParentId)
        case CollectionNames.Comments:
          const actualParentCollectionName = data.parentType
          const actualParentId = data.parent

          switch (actualParentCollectionName) {
            case CollectionNames.Assets:
              return routes.viewAssetWithVarAndCommentVar
                .replace(':assetId', actualParentId)
                .replace(':commentId', commentOrSocialPostId)
            case CollectionNames.Users:
              return routes.viewUserWithVar.replace(':userId', actualParentId)
            case CollectionNames.AssetAmendments:
              return routes.viewAmendmentWithVar.replace(
                ':userId',
                actualParentId
              )
            case CollectionNames.Reports:
              return routes.viewReportWithVar.replace(
                ':reportId',
                actualParentId
              )
            default:
              return `/#unknown-collection-${actualParentCollectionName}`
          }
      }
    case NotificationEvents.COMMENT_ON_ASSET_AMENDMENT:
      return routes.viewAmendmentWithVar.replace(':amendmentId', parentId)
    case NotificationEvents.COMMENT_ON_REPORT:
      return routes.viewReportWithVar.replace(':reportId', parentId)
  }

  switch (collectionName) {
    case CollectionNames.Assets:
      return routes.viewAssetWithVar.replace(':assetId', parentId)
    case CollectionNames.Users:
      return routes.viewUserWithVar.replace(':userId', parentId)
    default:
      return `/#unknown-message-${message}`
  }
}
