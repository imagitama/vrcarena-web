import { CollectionNames, AuthorFieldNames } from '../hooks/useDatabaseQuery'
import { simpleSearchRecords } from '../data-store'

export const getAuthorFromAuthorName = async authorName => {
  console.debug(`Getting author from booth author name "${authorName}"...`)

  const matches = await simpleSearchRecords(CollectionNames.Authors, {
    [AuthorFieldNames.name]: authorName
  })

  if (matches.length > 0) {
    console.debug(`Found author "${matches[0][AuthorFieldNames.name]}"`)
    return matches[0]
  } else {
    console.debug(`Found no authors for booth author name :(`)
  }

  return null
}
