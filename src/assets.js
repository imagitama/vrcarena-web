import { readRecord } from './data-store'
import {
  AccessStatuses,
  ApprovalStatuses,
  AssetFieldNames,
  AssetMetaFieldNames,
  AuthorFieldNames,
  CollectionNames,
  GetFullAssetsFieldNames,
  PublishStatuses,
  SpeciesFieldNames
} from './hooks/useDatabaseQuery'
import { getCanUserEditAnyAsset } from './users'

/** GETTERS */

export const insertFullAssetsFields = async sourceFields => {
  const newFields = { ...sourceFields }

  for (const fieldName in newFields) {
    const fieldValue = newFields[fieldName]
    const [
      fullAssetsFieldName,
      fullAssetsFieldValue
    ] = await getFieldNameAndValueForOutput(fieldName, fieldValue)

    newFields[fullAssetsFieldName] = fullAssetsFieldValue
  }

  return newFields
}

// we grab all of this stuff in the SQL query
// but while the user is editing this stuff we can't grab it
// so do it automagically
// TODO: Do this in a generic way like with "refs" in Firestore and "populateRefs: true"
// NOTE: This is the WORST performant way to do this stuff (especially grabbing children...)
export const getFieldNameAndValueForOutput = async (fieldName, newValue) => {
  switch (fieldName) {
    case AssetFieldNames.author:
      if (!newValue) {
        return [GetFullAssetsFieldNames.authorName, null]
      }

      const author = await readRecord(CollectionNames.Authors, newValue)
      return [GetFullAssetsFieldNames.authorName, author[AuthorFieldNames.name]]

    case AssetFieldNames.species:
      if (!newValue) {
        return [GetFullAssetsFieldNames.speciesNames, []]
      }

      const newSpeciesNames = []

      for (const speciesId of newValue) {
        const {
          [SpeciesFieldNames.singularName]: speciesName
        } = await readRecord(CollectionNames.Species, speciesId)
        newSpeciesNames.push(speciesName)
      }

      return [GetFullAssetsFieldNames.speciesNames, newSpeciesNames]

    case AssetFieldNames.discordServer:
      if (!newValue) {
        return [GetFullAssetsFieldNames.discordServerData, null]
      }

      const discordServerData = await readRecord(
        CollectionNames.DiscordServers,
        newValue
      )
      return [GetFullAssetsFieldNames.discordServerData, discordServerData]

    case AssetFieldNames.clonableWorld:
      if (!newValue) {
        return [GetFullAssetsFieldNames.clonableWorldData, null]
      }

      // make sure you query this view as it ensures only approved assets are usable
      const clonableWorldData = await readRecord(
        'getPublicAssets'.toLowerCase(),
        newValue
      )
      return [GetFullAssetsFieldNames.clonableWorldData, clonableWorldData]

    case AssetFieldNames.children:
      if (!newValue) {
        return [GetFullAssetsFieldNames.childrenData, []]
      }

      const newChildrenData = []

      for (const assetId of newValue) {
        const childData = await readRecord(
          'getPublicAssets'.toLowerCase(),
          assetId
        )
        newChildrenData.push(childData)
      }

      return [GetFullAssetsFieldNames.childrenData, newChildrenData]

    default:
      return [fieldName, newValue]
  }
}

export const getCanUserEditAsset = (assetMeta, userAdminMeta) => {
  if (!userAdminMeta) {
    return false
  }

  if (getCanUserEditAnyAsset(userAdminMeta)) {
    return true
  }

  if (
    getIsAssetADraft(assetMeta) &&
    getIsUserIdCreatorOfAsset(assetMeta, userAdminMeta.id)
  ) {
    return true
  }

  return false
}

export const getIsAssetPublic = assetMeta =>
  assetMeta[AssetMetaFieldNames.accessStatus] === AccessStatuses.Public &&
  assetMeta[AssetMetaFieldNames.approvalStatus] === ApprovalStatuses.Approved &&
  assetMeta[AssetMetaFieldNames.publishStatus] === PublishStatuses.Published

export const getIsAssetADraft = assetMeta =>
  assetMeta[AssetMetaFieldNames.publishStatus] === PublishStatuses.Draft

export const getIsUserIdCreatorOfAsset = (assetMeta, userId) =>
  assetMeta[AssetMetaFieldNames.createdBy] === userId

export const getCanAssetBePublished = assetMeta =>
  assetMeta[AssetMetaFieldNames.accessStatus] === AccessStatuses.Public &&
  (assetMeta[AssetMetaFieldNames.approvalStatus] === ApprovalStatuses.Waiting ||
    assetMeta[AssetMetaFieldNames.approvalStatus] ===
      ApprovalStatuses.Declined) &&
  assetMeta[AssetMetaFieldNames.publishStatus] === PublishStatuses.Draft
