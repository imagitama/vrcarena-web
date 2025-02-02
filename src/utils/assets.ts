import { PublishStatuses } from '../hooks/useDatabaseQuery'
import { AssetMeta } from '../modules/assets'

export const getDoesAssetNeedPublishing = (assetMeta: AssetMeta): boolean =>
  assetMeta.publishstatus === PublishStatuses.Draft

export const getIsUserCreator = (
  userId: string,
  assetMeta: AssetMeta
): boolean => userId === assetMeta.createdby
