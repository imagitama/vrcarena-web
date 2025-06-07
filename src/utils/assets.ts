import { readRecord } from '../data-store'
import { getCanUserEditAnyAsset } from '../users'
import {
  ArchivedReason,
  Asset,
  AssetMeta,
  DeclinedReason,
  DeletionReason,
  FullAsset,
  getIsAssetADraft,
} from '../modules/assets'
import {
  Author,
  CollectionNames as AuthorCollectionNames,
} from '../modules/authors'
import {
  CollectionNames as SpeciesCollectionNames,
  Species,
} from '../modules/species'
import {
  DiscordServer,
  CollectionNames as DiscordServerCollectionNames,
} from '../modules/discordservers'
import { UserAdminMeta } from '../modules/users'
import { AccessStatus, ApprovalStatus, PublishStatus } from '../modules/common'
import { SupabaseClient } from '@supabase/supabase-js'
import { getIsGumroadProductUrl } from '../gumroad'
import { getIsBoothProductUrl } from '../booth'
import { getIsJinxxyProductUrl } from '../jinxxy'
import { getIsItchProductUrl } from '../itch'
import { cleanupSourceUrl as cleanupSyncSourceUrl } from '../syncing'

export const getDoesAssetNeedPublishing = (assetMeta: AssetMeta): boolean =>
  assetMeta.publishstatus === PublishStatus.Draft

export const getIsUserCreator = (
  userId: string,
  assetMeta: AssetMeta
): boolean => userId === assetMeta.createdby

// we grab all of this stuff in the SQL query
// but while the user is editing this stuff we can't grab it
// so do it automagically
// TODO: Do this in a generic way like with "refs" in Firestore and "populateRefs: true"
// NOTE: This is the WORST performant way to do this stuff (especially grabbing children...)
export const getFieldNameAndValueForOutput = async (
  supabase: SupabaseClient,
  fieldName: keyof Asset,
  newValue: any
): Promise<[keyof FullAsset, any]> => {
  switch (fieldName) {
    case 'author':
      if (!newValue) {
        return ['authorname', null]
      }

      const author = await readRecord<Author>(
        supabase,
        AuthorCollectionNames.Authors,
        newValue
      )
      return ['authorname', author.name]

    case 'species':
      if (!newValue) {
        return ['speciesnames', []]
      }

      const newSpeciesNames = []

      for (const speciesId of newValue) {
        const { singularname } = await readRecord<Species>(
          supabase,
          SpeciesCollectionNames.Species,
          speciesId
        )
        newSpeciesNames.push(singularname)
      }

      return ['speciesnames', newSpeciesNames]

    case 'discordserver':
      if (!newValue) {
        return ['discordserverdata', null]
      }

      const discordServerData = await readRecord<DiscordServer>(
        supabase,
        DiscordServerCollectionNames.DiscordServers,
        newValue
      )
      return ['discordserverdata', discordServerData]

    default:
      return [fieldName, newValue]
  }
}

export const getCanUserEditAsset = (
  assetMeta: AssetMeta,
  userAdminMeta: UserAdminMeta
): boolean => {
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

export const getIsUserIdCreatorOfAsset = (
  assetMeta: AssetMeta,
  userId: string
): boolean => assetMeta.createdby === userId

export const getCanAssetBePublished = (assetMeta: AssetMeta): boolean =>
  assetMeta.accessstatus === AccessStatus.Public &&
  (assetMeta.approvalstatus === ApprovalStatus.Waiting ||
    assetMeta.approvalstatus === ApprovalStatus.Declined) &&
  assetMeta.publishstatus === PublishStatus.Draft

export interface DeletionReasonMeta {
  reason: DeletionReason
  label: string
}

export const deletionReasonMeta: DeletionReasonMeta[] = [
  {
    reason: DeletionReason.author_request,
    label: 'Requested by author',
  },
  {
    reason: DeletionReason.dmca_claim,
    label: 'DMCA claim',
  },
  {
    reason: DeletionReason.inferior,
    label: 'Duplicate or inferior version exists',
  },
  {
    reason: DeletionReason.violates_tos,
    label: 'Breaches our guidelines: https://www.vrcarena.com/guidelines',
  },
]

export const getDeletionReasonLabel = (reason: DeletionReason): string => {
  const match = deletionReasonMeta.find((meta) => meta.reason === reason)

  if (!match) {
    throw new Error(`Could not get deleted reason label for "${reason}"`)
  }

  return match.label
}

export interface ArchivedReasonMeta {
  reason: ArchivedReason
  label: string
}

export const archivedReasonMeta: ArchivedReasonMeta[] = [
  {
    reason: ArchivedReason.product_missing,
    label: 'Original product store page is missing',
  },
  {
    reason: ArchivedReason.product_discontinued,
    label: 'Original product store page is not for sale (eg. discontinued)',
  },
]

export const getArchivedReasonLabel = (reason: ArchivedReason): string => {
  const match = archivedReasonMeta.find((meta) => meta.reason === reason)

  if (!match) {
    throw new Error(`Could not get archived reason label for "${reason}"`)
  }

  return match.label
}

export interface DeclinedReasonMeta {
  reason: DeclinedReason
  label: string
}

export const declinedReasonMeta: DeclinedReasonMeta[] = [
  {
    reason: DeclinedReason.violates_tos,
    label: 'Breaches our guidelines: https://www.vrcarena.com/guidelines',
  },
  {
    reason: DeclinedReason.inferior,
    label: 'Inferior version of another asset',
  },
  {
    reason: DeclinedReason.missing_source,
    label: 'Missing source URL',
  },
  {
    reason: DeclinedReason.invalid_source,
    label: 'Invalid source URL',
  },
  {
    reason: DeclinedReason.missing_thumbnail,
    label: 'Missing thumbnail',
  },
  {
    reason: DeclinedReason.invalid_thumbnail,
    label: 'Invalid thumbnail',
  },
  {
    reason: DeclinedReason.missing_title,
    label: 'Missing title',
  },
  {
    reason: DeclinedReason.invalid_title,
    label: 'Invalid title',
  },
  {
    reason: DeclinedReason.missing_author,
    label: 'Missing author',
  },
  {
    reason: DeclinedReason.incorrect_author,
    label: 'Incorrect author',
  },
  {
    reason: DeclinedReason.missing_category,
    label: 'Missing category',
  },
  {
    reason: DeclinedReason.incorrect_category,
    label: 'Incorrect category',
  },
  {
    reason: DeclinedReason.missing_description,
    label: 'Missing description',
  },
  {
    reason: DeclinedReason.too_short_description,
    label: 'Too short description',
  },
  {
    reason: DeclinedReason.missing_tags,
    label: 'Missing tags',
  },
  {
    reason: DeclinedReason.not_many_tags,
    label: 'Too few tags',
  },
  {
    reason: DeclinedReason.missing_species,
    label: 'Missing species',
  },
  {
    reason: DeclinedReason.incorrect_species,
    label: 'Incorrect species',
  },
  {
    reason: DeclinedReason.missing_nsfw_flag,
    label: 'Should be flagged NSFW',
  },
]

export const getDeclinedReasonLabel = (reason: DeclinedReason): string => {
  const match = declinedReasonMeta.find((meta) => meta.reason === reason)

  if (!match) {
    throw new Error(`Could not get declined reason label for "${reason}"`)
  }

  return match.label
}

export enum PublishErrorCode {
  IS_NOT_DRAFT = 'IS_NOT_DRAFT',
  NOT_CREATOR = 'NOT_CREATOR',
  USER_BANNED = 'USER_BANNED',
  UNKNOWN = 'UNKNOWN',
}

export const getErrorMessageForCode = (errorCode: string): string => {
  switch (errorCode) {
    case PublishErrorCode.IS_NOT_DRAFT:
      return 'Only drafts can be published'
    case PublishErrorCode.NOT_CREATOR:
      return 'You are not the creator of this asset'
    case PublishErrorCode.USER_BANNED:
      return 'You are banned'
    default:
      return 'Unknown'
  }
}

export const cleanupSourceUrl = (url: string): string => {
  if (
    getIsGumroadProductUrl(url) ||
    getIsBoothProductUrl(url) ||
    getIsJinxxyProductUrl(url) ||
    getIsItchProductUrl(url)
  ) {
    return cleanupSyncSourceUrl(url)
  }

  return url.trim()
}
