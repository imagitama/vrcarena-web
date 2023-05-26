import * as routes from './routes'

export const topics = {
  COMMENT_ON_ASSET: 'COMMENT_ON_ASSET'
}

export const topicLabels = {
  [topics.COMMENT_ON_ASSET]: 'Comment on asset'
}

export const getLabelForTopic = topic => topicLabels[topic]

export const getSubscriptionMessage = (topic, extraData = {}) => {
  return getLabelForTopic(topic)
}

export const getRouteForTopic = (topic, parentId, extraData = {}) => {
  switch (topic) {
    case topics.COMMENT_ON_ASSET:
      return routes.viewAssetWithVarAndCommentVar
        .replace(':assetId', parentId)
        .replace(':commentId', extraData.comment)
    default:
      return '/error-not-configured'
  }
}
