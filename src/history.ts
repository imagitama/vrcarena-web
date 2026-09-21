import * as routes from './routes'
import { CollectionNames as AssetsCollectionNames } from './modules/assets'
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

export const getLinkUrl = ({
  message,
  parent: parentId,
  parenttable: parentTable,
}: HistoryEntry) => {
  switch (parentTable) {
    case AssetsCollectionNames.Assets:
    case AssetsCollectionNames.AssetsMeta:
      return routes.viewAssetWithVarAndCommentVar.replace(':assetId', parentId)

    default:
      return `Parent: ${parentTable}`
  }
}
