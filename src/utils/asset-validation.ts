import defaultThumbnailUrl from '@/assets/images/default-thumbnail.webp'
import { Asset, AssetCategory } from '@/modules/assets'
import { adultSearchTerms } from '@/config'

export enum BlockingErrorTypes {
  NO_SOURCE_URL = 'NO_SOURCE_URL',
  NO_TITLE = 'NO_TITLE',
  DEFAULT_TITLE = 'DEFAULT_TITLE',
  NO_AUTHOR = 'NO_AUTHOR',
  NO_THUMBNAIL = 'NO_THUMBNAIL',
  NO_DESCRIPTION = 'NO_DESCRIPTION',
  NO_TAGS = 'NO_TAGS',
}

export enum NonBlockingErrorTypes {
  INVALID_TITLE = 'INVALID_TITLE',
  NO_SPECIES = 'NO_SPECIES',
  SHORT_DESCRIPTION = 'SHORT_DESCRIPTION',
  NOT_MANY_TAGS = 'NOT_MANY_TAGS',
  NOT_MARKED_NSFW = 'NOT_MARKED_NSFW',
  MISSING_ACCESSORY_PARENT = 'MISSING_ACCESSORY_PARENT',
  NO_ATTACHMENTS = 'NO_ATTACHMENTS',
  NO_PAID_OR_FREE_TAG = 'NO_PAID_OR_FREE_TAG',
}

export const validationErrorMessages = {
  [BlockingErrorTypes.NO_TITLE]: 'has no title',
  [BlockingErrorTypes.DEFAULT_TITLE]: 'is using the default title',
  [NonBlockingErrorTypes.INVALID_TITLE]: 'has an invalid title',
  [BlockingErrorTypes.NO_AUTHOR]: 'has no author',
  [NonBlockingErrorTypes.NO_SPECIES]: 'has no species',
  [BlockingErrorTypes.NO_THUMBNAIL]: 'has no thumbnail',
  [BlockingErrorTypes.NO_SOURCE_URL]: 'has no source URL',
  [BlockingErrorTypes.NO_DESCRIPTION]: 'has no description',
  [NonBlockingErrorTypes.SHORT_DESCRIPTION]:
    'has a too short description (less than 20 characters)',
  [BlockingErrorTypes.NO_TAGS]: 'has no tags',
  [NonBlockingErrorTypes.NOT_MANY_TAGS]:
    "doesn't have many tags (we recommend 4 or more)",
  [NonBlockingErrorTypes.NOT_MARKED_NSFW]:
    'has not been flagged as NSFW even though it contains NSFW terms',
  [NonBlockingErrorTypes.MISSING_ACCESSORY_PARENT]:
    'has no linked asset (this is required if your accessory needs a base avatar)',
  [NonBlockingErrorTypes.NO_ATTACHMENTS]:
    'has no attached files (please attach at least one larger image)',
  [NonBlockingErrorTypes.NO_PAID_OR_FREE_TAG]: `should have the paid or free tag`,
}

export const getIfShouldBeNsfw = (asset: Asset): boolean => {
  if (asset.isadult) {
    return false
  }

  if (
    asset.description &&
    adultSearchTerms.some((term) =>
      asset.description.toLowerCase().includes(term)
    )
  ) {
    return true
  }
  if (
    asset.title &&
    adultSearchTerms.some((term) => asset.title.toLowerCase().includes(term))
  ) {
    return true
  }

  return false
}

export const getValidationErrorMessagesForAsset = (
  asset: Asset
): (BlockingErrorTypes | NonBlockingErrorTypes)[] => {
  const messages = []

  if (!asset.title) {
    messages.push(BlockingErrorTypes.NO_TITLE)
  }
  if (asset.title && asset.title === 'My draft asset') {
    messages.push(BlockingErrorTypes.DEFAULT_TITLE)
  }
  if (!asset.author) {
    messages.push(BlockingErrorTypes.NO_AUTHOR)
  }
  if (
    asset.category === AssetCategory.Avatar &&
    (!asset.species || !asset.species.length)
  ) {
    messages.push(NonBlockingErrorTypes.NO_SPECIES)
  }
  if (!asset.thumbnailurl || asset.thumbnailurl === defaultThumbnailUrl) {
    messages.push(BlockingErrorTypes.NO_THUMBNAIL)
  }
  if (!asset.description) {
    messages.push(BlockingErrorTypes.NO_DESCRIPTION)
  }
  if (asset.description && asset.description.length < 20) {
    messages.push(NonBlockingErrorTypes.SHORT_DESCRIPTION)
  }
  if (!asset.tags || !asset.tags.length) {
    messages.push(BlockingErrorTypes.NO_TAGS)
  }
  if (asset.tags && asset.tags.length < 4) {
    messages.push(NonBlockingErrorTypes.NOT_MANY_TAGS)
  }
  if (
    asset.tags &&
    !asset.tags.includes('free') &&
    !asset.tags.includes('paid')
  ) {
    messages.push(NonBlockingErrorTypes.NO_PAID_OR_FREE_TAG)
  }
  if (getIfShouldBeNsfw(asset)) {
    messages.push(NonBlockingErrorTypes.NOT_MARKED_NSFW)
  }
  if (!asset.sourceurl) {
    messages.push(BlockingErrorTypes.NO_SOURCE_URL)
  }
  if (
    asset.category === AssetCategory.Accessory &&
    (!asset.relations || !asset.relations.length)
  ) {
    messages.push(NonBlockingErrorTypes.MISSING_ACCESSORY_PARENT)
  }

  return messages
}
