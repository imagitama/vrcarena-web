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
import { getUserId } from '../../supabase'
import * as routes from '../../routes'
import { getLabelForNotification, getLinkUrl } from '../../notifications'
import { CollectionNames as NotificationsCollectionNames } from '../../modules/notifications'

import { MenuItemData } from '../menu'
import { SupabaseClient } from '@supabase/supabase-js'

export const cart = async (
  supabase: SupabaseClient
): Promise<MenuItemData[]> => {
  try {
    const ids: string[] = retrieveFromLocalStorage(cartIdsStorageKey) || []

    if (!ids.length) {
      return []
    }

    // TODO: Use hook/abstraction
    const { data, error } = await supabase
      .from(CollectionNames.Assets)
      // TODO: Better type safety
      .select<string, Asset>(`id, title, thumbnailurl`)
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
        includeInCount: false,
      } as MenuItemData,
    ]
      .concat(
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
      .concat([
        {
          id: 'view-cart',
          label: 'View Cart',
          url: routes.cart,
          includeInCount: false,
        },
      ])
  } catch (err) {
    console.error(err)
    handleError(err)
    return []
  }
}

export const queue = async (
  supabase: SupabaseClient
): Promise<MenuItemData[]> => {
  try {
    const userId = getUserId()

    if (!userId) {
      return []
    }

    // TODO: Use hook/abstraction
    const { data, error } = await supabase
      // TODO: Use const
      .from('getFullAssets'.toLowerCase())
      .select<string, FullAsset>(`*`)
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

export const notifications = async (
  supabase: SupabaseClient
): Promise<MenuItemData[]> => {
  try {
    const userId = getUserId()

    if (!userId) {
      return []
    }

    // TODO: Use hook/abstraction
    const { data, error } = await supabase
      .from('getFullNotification'.toLowerCase())
      .select<string, FullNotification>(`*`)
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
          supabase,
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
