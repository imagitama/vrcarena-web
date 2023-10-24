import * as routes from './routes'

export const questAvatars = 'quest_compatible category:avatar'
export const freeAvatars = 'free category:avatar'

export const getPathForQueryString = (query: string): string =>
  routes.queryWithVar.replace(':query', encodeURIComponent(query))

export const prepareValueForQuery = (value: string): string => {
  let newValue = value

  if (newValue.includes(' ')) {
    // TODO: Handle when " in value
    newValue = `"${newValue}"`
  }

  return newValue
}
