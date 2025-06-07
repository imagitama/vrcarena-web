import * as routes from './routes'

export const topics = {
  COMMENT_ON_ASSET: 'COMMENT_ON_ASSET',
}

export const topicLabels = {
  [topics.COMMENT_ON_ASSET]: 'Comment on asset',
}

export const getLabelForTopic = (topic: string): string => topicLabels[topic]

export const getSubscriptionMessage = (topic: string, extraData = {}) => {
  return getLabelForTopic(topic)
}

export const getRouteForTopic = (
  topic: string,
  parentId: string,
  extraData: any = {}
) => {
  switch (topic) {
    case topics.COMMENT_ON_ASSET:
      return routes.viewAssetWithVarAndCommentVar
        .replace(':assetId', parentId)
        .replace(':commentId', extraData.comment)
    default:
      return '/error-not-configured'
  }
}
