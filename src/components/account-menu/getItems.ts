import { deleteRecord } from '../../data-store'
import { Asset, CollectionNames, FullAsset } from '../../modules/assets'
import { handleError } from '../../error-handling'
import { cartIdsStorageKey } from '../../cart'
import {
  AccessStatuses,
  ApprovalStatuses,
  PublishStatuses,
} from '../../hooks/useDatabaseQuery'
import { retrieveFromLocalStorage } from '../../storage'
import { client, getUserId } from '../../supabase'
import * as routes from '../../routes'
import { getLabelForNotification, getLinkUrl } from '../../notifications'
import { CollectionNames as NotificationsCollectionNames } from '../../modules/notifications'

import { MenuItemData } from '../menu'

export const cart = async (): Promise<MenuItemData[]> => {
  try {
    const ids: string[] = retrieveFromLocalStorage(cartIdsStorageKey) || []

    if (!ids.length) {
      return []
    }

    const { data, error } = await client
      .from<Asset>(CollectionNames.Assets)
      // TODO: Better type safety
      .select(`id, title, thumbnailurl`)
      .or(ids.map((id) => `id.eq.${id}`).join(','))

    if (!data) {
      console.warn(`Failed to get assets for cart: no data`, { ids })
      return []
    }

    if (error) {
      throw new Error('Failed to get cart items')
    }

    return [
      {
        id: 'info',
        label: 'NOTE: You cannot purchase anything from VRCArena.',
        disabled: true,
      } as MenuItemData,
    ].concat(
      data.map((asset) => ({
        id: asset.id,
        url: routes.viewAssetWithVar.replace(
          ':assetId',
          asset.slug || asset.id
        ),
        label: asset.title,
        imageUrl: asset.thumbnailurl,
      }))
    )
  } catch (err) {
    console.error(err)
    handleError(err)
    return []
  }
}

export const queue = async (): Promise<MenuItemData[]> => {
  try {
    const userId = getUserId()

    if (!userId) {
      return []
    }

    const { data, error } = await client
      .from<FullAsset>('getFullAssets'.toLowerCase())
      .select(`*`)
      .eq('createdby', userId)
      .eq('publishstatus', PublishStatuses.Published)
      .eq('approvalstatus', ApprovalStatuses.Waiting)
      .eq('accessstatus', AccessStatuses.Public)
      .order('createdat', {
        ascending: false,
      })
      .limit(25)

    if (!data) {
      console.warn(`Failed to get assets for queue: no data`)
      return []
    }

    if (error) {
      throw new Error('Failed to get queued assets')
    }

    return data.map((asset) => ({
      id: asset.id,
      url: routes.viewAssetWithVar.replace(':assetId', asset.slug || asset.id),
      label: asset.title,
      imageUrl: asset.thumbnailurl,
    }))
  } catch (err) {
    console.error(err)
    handleError(err)
    return []
  }
}

interface Notification {
  id: string
  recipient: string
  message: string
  parent: string
  parenttable: string
  data: Object
  createdat: Date
}

interface FullNotification extends Notification {
  parentdata: Object
}

export const notifications = async (): Promise<MenuItemData[]> => {
  try {
    const userId = getUserId()

    if (!userId) {
      return []
    }

    const { data, error } = await client
      .from<FullNotification>('getFullNotification'.toLowerCase())
      .select(`*`)
      .eq('recipient', userId)
      .limit(25)

    if (!data) {
      console.warn(`Failed to get notifications for user: no data`)
      return []
    }

    if (error) {
      throw new Error('Failed to get notifications')
    }

    return data.map((notification) => ({
      id: notification.id,
      url: getLinkUrl(notification),
      label: getLabelForNotification(notification),
      date: notification.createdat,
      onRemove: async () => {
        console.debug(`Removing notification ${notification.id}...`)
        await deleteRecord(
          NotificationsCollectionNames.Notifications,
          notification.id
        )
      },
    }))
  } catch (err) {
    console.error(err)
    handleError(err)
    return []
  }
}
