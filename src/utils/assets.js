import {
  AccessStatuses,
  ApprovalStatuses,
  AssetMetaFieldNames,
  PublishStatuses,
} from '../hooks/useDatabaseQuery'

export const getIsAssetPublic = assetMeta => {
  return (
    assetMeta[AssetMetaFieldNames.approvalStatus] ===
      ApprovalStatuses.Approved &&
    assetMeta[AssetMetaFieldNames.accessStatus] === AccessStatuses.Public &&
    assetMeta[AssetMetaFieldNames.publishStatus] === PublishStatuses.Published
  )
}

export const getDoesAssetNeedPublishing = assetMeta =>
  assetMeta[AssetMetaFieldNames.publishStatus] === PublishStatuses.Draft

export const getIsUserCreator = (userId, assetMeta) => userId === assetMeta[AssetMetaFieldNames.createdBy]