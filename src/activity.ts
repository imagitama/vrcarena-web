import * as routes from './routes'
import {
  Asset,
  CollectionNames as AssetCollectionNames
} from './modules/assets'
import { User, CollectionNames as UserCollectionNames } from './modules/users'

export const ActivityEvents = {
  ASSET_APPROVED: 'ASSET_APPROVED',
  COMMENT_CREATED: 'COMMENT_CREATED'
}

export const getLabel = (
  parentTable: string,
  parentId: string,
  message: string,
  parentData: any,
  extraData: { [collectionName: string]: any }
): string => {
  let asset: Asset, user: User

  switch (message) {
    case ActivityEvents.ASSET_APPROVED:
      asset = extraData[AssetCollectionNames.Assets]
      return `Asset "${asset.title}" was approved`
    case ActivityEvents.COMMENT_CREATED:
      if (extraData[AssetCollectionNames.Assets]) {
        asset = extraData[AssetCollectionNames.Assets]
        return `commented on asset "${asset.title}"`
      } else if (extraData[UserCollectionNames.Users]) {
        user = extraData[UserCollectionNames.Users]
        return `commented on the profile of "${user.username}"`
      } else {
        throw new Error(`Need an asset or user for COMMENT_CREATED`)
      }
    default:
      throw new Error(`Unknown message ${message}`)
  }
}

export const getUrl = (
  parentTable: string,
  parentId: string,
  message: string,
  parentData: any,
  extraData: { [collectionName: string]: any }
): string => {
  let asset: Asset, user: User

  switch (message) {
    case ActivityEvents.ASSET_APPROVED:
      asset = extraData[AssetCollectionNames.Assets]
      return routes.viewAssetWithVar.replace(':assetId', asset.id)
    case ActivityEvents.COMMENT_CREATED:
      if (extraData[AssetCollectionNames.Assets]) {
        asset = extraData[AssetCollectionNames.Assets]
        return routes.viewAssetWithVar.replace(':assetId', asset.id)
      } else if (extraData[UserCollectionNames.Users]) {
        user = extraData[UserCollectionNames.Users]
        return routes.viewUserWithVar.replace(':userId', user.id)
      } else {
        throw new Error(`Need an asset or user for COMMENT_CREATED`)
      }
    default:
      throw new Error(`Unknown message ${message}`)
  }
}
