import React from 'react'
import * as routes from './routes'
import categoriesMeta from './category-meta'
import {
  AssetCategories,
  UserCacheFieldNames,
  UserRoles,
} from './hooks/useDatabaseQuery'
import { UserPreferencesFieldNames } from './modules/user'

export function canShowMenuItem(menuItem, user, userPreferences) {
  if (menuItem.requiresAuth && !user) {
    return false
  }
  if (menuItem.requiresNotAuth && user) {
    return false
  }
  if (
    menuItem.requiresEditor &&
    (!user ||
      (user[UserCacheFieldNames.role] !== UserRoles.Editor &&
        user[UserCacheFieldNames.role] !== UserRoles.Admin))
  ) {
    return false
  }
  if (
    menuItem.requiresAdmin &&
    (!user || user[UserCacheFieldNames.role] !== UserRoles.Admin)
  ) {
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
    if (userPreferences[UserPreferencesFieldNames.enabledAdultContent]) {
      return true
    }
    return false
  }
  return true
}

export function getLabelForMenuItem(Label) {
  if (typeof Label === 'string') {
    return Label
  }
  return <Label />
}

const categoriesNotToShow = [
  AssetCategories.world,
  AssetCategories.article,
  AssetCategories.retexture,
  AssetCategories.content,
  AssetCategories.alteration,
]

export default [
  ...Object.entries(categoriesMeta)
    .filter(([name]) => !categoriesNotToShow.includes(name))
    .map(([name, meta]) => ({
      id: `category-${name}`,
      label: meta.name,
      url: routes.viewCategoryWithVar.replace(':categoryName', name),
    })),
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
        id: AssetCategories.retexture,
        url: routes.viewCategoryWithVar.replace(
          ':categoryName',
          AssetCategories.retexture
        ),
        label: categoriesMeta[AssetCategories.retexture].name,
      },
      {
        id: 'collections',
        url: routes.viewCollections,
        label: 'Collections',
      },
      {
        id: 'news',
        url: routes.news,
        label: 'News',
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
        id: AssetCategories.world,
        url: routes.viewCategoryWithVar.replace(
          ':categoryName',
          AssetCategories.world
        ),
        label: categoriesMeta[AssetCategories.world].name,
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
