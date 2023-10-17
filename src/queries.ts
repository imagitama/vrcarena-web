import * as routes from './routes'

export const questAvatars = 'quest_compatible category:avatar'
export const freeAvatars = 'free category:avatar'

export const getPathForQueryString = (query: string): string =>
  routes.queryWithVar.replace(':query', encodeURIComponent(query))
