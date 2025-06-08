import React from 'react'
import * as routes from './routes'
import categoriesMeta from './category-meta'
import { UserPreferences } from './modules/user'
import { AssetCategory } from './modules/assets'
import { FullUser, UserRoles } from './modules/users'

export interface MenuItem {
  id: string
  label: string
  url?: string
  requiresAuth?: boolean
  requiresNotAuth?: boolean
  requiresEditor?: boolean
  requiresAdmin?: boolean
  requiresAdminOrEditor?: boolean
  requiresAdultContentEnabled?: boolean
  children?: MenuItem[]
}

export function canShowMenuItem(
  menuItem: MenuItem,
  user: FullUser | null,
  userPreferences: UserPreferences | false | null
): boolean {
  if (menuItem.requiresAuth && !user) {
    return false
  }
  if (menuItem.requiresNotAuth && user) {
    return false
  }
  if (
    menuItem.requiresEditor &&
    (!user || (user.role !== UserRoles.Editor && user.role !== UserRoles.Admin))
  ) {
    return false
  }
  if (menuItem.requiresAdmin && (!user || user.role !== UserRoles.Admin)) {
    return false
  }
  if (menuItem.requiresAdminOrEditor) {
    if (!user) {
      return false
    }
    if (user.isAdmin || user.isEditor) {
      return true
    }
    return false
  }
  if (menuItem.requiresAdultContentEnabled) {
    if (!userPreferences) {
      return false
    }
    if (userPreferences.enabledadultcontent) {
      return true
    }
    return false
  }
  return true
}

export function getLabelForMenuItem(Label: string | React.ReactElement): any {
  if (typeof Label === 'string') {
    return Label
  }
  return React.cloneElement(Label)
}

const items: MenuItem[] = [
  ...Object.entries(categoriesMeta)
    .filter(([name]) => name !== AssetCategory.Tutorial)
    .map(([name, meta]) => ({
      id: `category-${name}`,
      label: meta.name,
      url: routes.viewCategoryWithVar.replace(':categoryName', name),
    })),
  {
    id: 'tutorials',
    label: 'Tutorials',
    url: routes.tutorials,
  },
  {
    id: 'species',
    label: 'Species',
    url: routes.viewAllSpecies,
  },
  {
    id: 'more',
    label: 'More',
    children: [
      {
        id: 'events',
        url: routes.events,
        label: 'Events',
      },
      {
        id: AssetCategory.Retexture,
        url: routes.viewCategoryWithVar.replace(
          ':categoryName',
          AssetCategory.Retexture
        ),
        label: categoriesMeta[AssetCategory.Retexture].name,
      },
      {
        id: 'collections',
        url: routes.viewCollections,
        label: 'Collections',
      },
      {
        id: 'authors',
        url: routes.authors,
        label: 'Authors',
      },
      {
        id: 'users',
        url: routes.users,
        label: 'Users',
      },
      {
        id: 'reviews',
        url: routes.reviews,
        label: 'Reviews',
      },
      {
        id: 'new-assets',
        url: routes.newAssets,
        label: 'New Assets',
      },
      {
        id: 'streams',
        url: routes.streams,
        label: 'Streams',
      },
      {
        id: 'discord-servers',
        label: 'Discord Servers',
        url: routes.discordServers,
      },
      {
        id: 'about',
        url: routes.about,
        label: 'About',
      },
      {
        id: 'patreon',
        url: routes.patreon,
        label: 'Patreon',
      },
      {
        id: 'tags',
        url: routes.tags,
        label: 'Tags',
      },
      {
        id: 'adult',
        url: routes.nsfw,
        label: 'NSFW Content',
        requiresAdultContentEnabled: true,
      },
      {
        id: 'social',
        label: 'Social',
        url: routes.social,
      },
      {
        id: 'admin',
        label: 'Admin',
        url: routes.admin,
        requiresEditor: true,
      },
    ],
  },
]

export default items
