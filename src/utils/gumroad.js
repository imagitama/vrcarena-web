import { areasByCategory } from '../areas'
import { simpleSearchRecords } from '../data-store'
import { CollectionNames, AuthorFieldNames } from '../hooks/useDatabaseQuery'

export const getCodeFromGumroadUrl = url => {
  if (!url) {
    return ''
  }
  return url
    .split('?')[0]
    .split('/')
    .pop()
}

export const getAuthorSubdomainFromGumroadUrl = url => {
  if (!url) {
    return ''
  }
  const urlObj = new URL(url)
  return urlObj.hostname.split('.gumroad')[0]
}

export const isValidPreviewImageUrl = url => {
  if (!url) {
    return false
  }
  if (url.indexOf('.gif') !== -1) {
    return false
  }
  return true
}

export const getImageUrlAsFile = async url => {
  const resp = await fetch(url)
  const blob = await resp.blob()
  const fileExt = url
    .split('?')[0]
    .split('/')
    .pop()
    .split('.')[1]
  const filename = `my-gumroad-image.${fileExt}`
  const file = new File([blob], filename, blob)
  console.debug(`Got image url "${url}" as file "${filename}"`)
  return file
}

const tagsSearch = {
  // compatibility
  quest_compatible: ['quest'],
  sdk2: ['sdk2'],
  sdk3: ['SDK3'],
  // included
  blendfile_included: ['Blender file', 'Blendfile', 'Blend file'],
  unity_package_included: [
    'unitypackage',
    'unity setup package',
    'unity package'
  ],
  substance_painter_included: ['substance'],
  nsfw_included: ['penis', 'vagina', 'genitals'],
  prefabs_included: ['prefab'],
  scene_included: ['unity scene'],
  psd_included: ['photoshop', 'psd'],
  uv_mapped: ['uv layout'],
  // features
  sdk3_puppets: ['puppet'],
  dynamic_bones_ready: ['dynamic bones'],
  customizable_body: ['body shape', 'body slider'],
  hand_colliders: ['colliders'],
  full_body_ready: ['full body'],
  multiple_blend_shapes: ['blend shapes', 'shapekey', 'body slider', 'viseme'],
  toggle_accessories: ['Toggleable'],
  // appearance
  collar: ['collar'],
  glasses: ['glasses'],
  clothes: ['clothes', 'shirt', 'jeans', 'pants'],
  hair: ['hair'],
  // animation
  custom_gestures: [
    'facial expression',
    'hand gesture',
    'face expression',
    'gestures'
  ],
  custom_idle_animation: ['idle animation'],
  custom_emotes: ['emote']
}

export const getTagsFromDescription = desc => {
  const tags = []
  const descLower = desc.toLowerCase()

  for (const tagName in tagsSearch) {
    for (const searchTerm of tagsSearch[tagName]) {
      if (
        descLower.includes(searchTerm.toLowerCase()) &&
        !tags.includes(tagName)
      ) {
        tags.push(tagName)
      }
    }
  }

  return tags
}

export const defaultTags = ['paid']

const searchTextForCategory = textToSearch => {
  const chunks = textToSearch.split(' ').map(chunk => chunk.toLowerCase())

  for (const [categoryName, areas] of Object.entries(areasByCategory)) {
    for (const [, { tags }] of Object.entries(areas)) {
      for (const tag of tags) {
        if (chunks.includes(tag)) {
          return categoryName
        }
      }
    }
  }
}

export const getCategoryFromNameAndDescription = (name, desc) => {
  const nameMatch = searchTextForCategory(name)

  if (nameMatch) {
    return nameMatch
  }

  const descMatch = searchTextForCategory(desc)

  if (descMatch) {
    return descMatch
  }

  return null
}

export const getAuthorFromGumroadSubdomain = async subdomain => {
  console.debug(`Getting author from gumroad subdomain "${subdomain}"...`)

  const matches = await simpleSearchRecords(CollectionNames.Authors, {
    [AuthorFieldNames.name]: subdomain
  })

  if (matches.length > 0) {
    console.debug(`Found author "${matches[0][AuthorFieldNames.name]}"`)
    return matches[0]
  } else {
    console.debug(`Found no authors for gumroad subdomain :(`)
  }

  return null
}
