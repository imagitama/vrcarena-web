import { PublishStatus } from '../modules/common'
import { AssetMeta } from '../modules/assets'

export const getDoesAssetNeedPublishing = (assetMeta: AssetMeta): boolean =>
  assetMeta.publishstatus === PublishStatus.Draft

export const getIsUserCreator = (
  userId: string,
  assetMeta: AssetMeta
): boolean => userId === assetMeta.createdby
