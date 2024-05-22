// TODO: Move to utils/index.ts

import { validate as validateUuid } from 'uuid'
import { PatreonStatuses, UserRoles } from './hooks/useDatabaseQuery'
import { FullUser } from './modules/users'

export function scrollToTop(isSmooth: boolean = true): void {
  console.debug(`Scrolling to top...`)
  return scrollTo(0, isSmooth)
}

export function scrollTo(x: number, isSmooth: boolean = true): void {
  console.debug(`Scrolling to ${x}...`)
  try {
    window.scrollTo({
      top: x,
      left: 0,
      behavior: isSmooth ? 'smooth' : 'auto',
    })
  } catch (err) {
    if (
      (err as Error).message.includes(
        "Failed to execute 'scrollTo' on 'Window': 2 arguments required, but only 1 present."
      )
    ) {
      // newer browsers only need 1 argument: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo
      return
    }
    throw err
  }
}

export function scrollToSide(
  x: number,
  y: number,
  isSmooth: boolean = true
): void {
  console.debug(`Scrolling to ${x},${y}...`)
  try {
    window.scrollTo({
      top: x,
      left: y,
      behavior: isSmooth ? 'smooth' : 'auto',
    })
  } catch (err) {
    if (
      (err as Error).message.includes(
        "Failed to execute 'scrollTo' on 'Window': 2 arguments required, but only 1 present."
      )
    ) {
      // newer browsers only need 1 argument: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo
      return
    }
    throw err
  }
}

export function scrollToElement(
  element: HTMLElement,
  isSmooth = true,
  padding = 0
): void {
  console.debug(`Scrolling to element...`, element)
  return scrollTo(element.getBoundingClientRect().top - padding, isSmooth)
}

export function getDescriptionForHtmlMeta(desc: string): string {
  if (!desc) {
    return ''
  }

  let newDesc = desc.split('\n').join(' ').replace(/\s\s+/g, ' ')
  if (newDesc.length > 255) {
    return `${newDesc.substr(0, 255)}...`
  }
  return newDesc
}

export function getOpenGraphUrlForRouteUrl(routeUrl: string): string {
  return `https://www.vrcarena.com${routeUrl}`
}

export function convertSearchTermToUrlPath(searchTerm: string): string {
  return window.encodeURIComponent(searchTerm)
}

export function parseSearchTermFromUrlPath(urlPath: string): string {
  return window.decodeURIComponent(urlPath)
}

export function canEditPedestal(user: FullUser) {
  if (!user) {
    return false
  }

  if (user.role === UserRoles.Admin || user.role === UserRoles.Editor) {
    return true
  }

  if (user.patreonstatus === PatreonStatuses.Patron) {
    return true
  }

  return false
}

export function canEditAuthor(user: FullUser): boolean {
  if (!user) {
    return false
  }
  if (user.role === UserRoles.Admin || user.role === UserRoles.Editor) {
    return true
  }
  return false
}

export function canEditDiscordServer(user: FullUser): boolean {
  if (!user) {
    return false
  }
  if (user.role === UserRoles.Admin || user.role === UserRoles.Editor) {
    return true
  }
  return false
}

export function canApproveAsset(user: FullUser): boolean {
  if (!user) {
    return false
  }
  if (user.role === UserRoles.Admin || user.role === UserRoles.Editor) {
    return true
  }
  return false
}

export function canEditSpecies(user: FullUser) {
  if (!user) {
    return false
  }
  if (user.role === UserRoles.Admin || user.role === UserRoles.Editor) {
    return true
  }
  return false
}

// Some uploaded files have an uppercase extension (.PNG)
// TODO: Upload the files always as lowercase?
function getValidUrl(url: string): string {
  if (!url) {
    return ''
  }
  return url.toLowerCase()
}

export function isUrl(string: any): string is string {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function isUrlAnImage(url: string): boolean {
  const validUrl = getValidUrl(url)
  return (
    validUrl.includes('jpg') ||
    validUrl.includes('png') ||
    validUrl.includes('gif') ||
    validUrl.includes('jpeg') ||
    validUrl.includes('webp')
  )
}

export function isUrlAVideo(url: string): boolean {
  const validUrl = getValidUrl(url)
  return validUrl.includes('.mp4') || validUrl.includes('.avi')
}

export function isUrlAFbx(url: string): boolean {
  const validUrl = getValidUrl(url)
  return validUrl.includes('.fbx')
}

export function isUrlAYoutubeVideo(url: string): boolean {
  const validUrl = getValidUrl(url)
  return validUrl.includes('youtu.be') || validUrl.includes('youtube.com')
}

export const getYouTubeVideoIdFromUrl = (url: string): string => {
  // https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
  // @ts-ignore
  return url.match(/([a-z0-9_-]{11})/gim)[0]
}

export function isUrlNotAnImageOrVideo(url: string): boolean {
  const validUrl = getValidUrl(url)
  return !isUrlAnImage(validUrl) && !isUrlAVideo(validUrl)
}

export function isUrlATweet(url: string): boolean {
  const validUrl = getValidUrl(url)
  return /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/.test(
    validUrl
  )
}

export function getFilenameFromUrl(url: string): string {
  if (!url) {
    return ''
  }

  if (isUrlAYoutubeVideo(url)) {
    return 'YouTube Video'
  }

  if (url.includes('base64')) {
    return 'base64url'
  }

  const validUrl = getValidUrl(url)

  // @ts-ignore TODO fixup!
  return validUrl
    .replace('%2F', '/')
    .split('/')
    .pop()
    .split('?')
    .shift()
    .replace(/%20/g, ' ')
    .split('___')
    .pop()
}

export function createRef(collectionName: string, id: string): string {
  // NOTE: This used to return { ref: { collectionName, id }} but Supabase/SQL doesn't support "refs"
  // so we just use a string and trust the column is set properly
  return id
}

export function isRef(value: any): boolean {
  return value && typeof value === 'object' && value.hasOwnProperty('ref')
}

// even if you grant public access to a Firebase bucket
// if you provide an access ID it will still error?
// so strip that out
export function fixAccessingImagesUsingToken(url: string): string {
  if (!url || !url.includes('GoogleAccessId')) {
    return url
  }
  return url.split('?')[0]
}

export function isGumroadUrl(url: string): boolean {
  return url.includes('gumroad.com')
}

export function isBoothUrl(url: string): boolean {
  return url.includes('booth.pm')
}

export function isAbsoluteUrl(url: string): boolean {
  return url.includes('http')
}

export function isGitHubUrl(url: string): boolean {
  return url.includes('github.com')
}

export const getQueryParam = (name: string): string | null => {
  // eslint-disable-next-line
  const url = new URL(location.href)
  return url.searchParams.get(name)
}

export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const base64EncodeString = (string: string): string => btoa(string)

export const parseBase64String = (string: string): string => atob(string)

export const copyTextToClipboard = (text: string): Promise<void> => {
  if (!location.href.includes('https')) {
    console.warn('Cannot copy text in insecure location')
    return Promise.resolve()
  }

  // new api - https only
  return navigator.clipboard.writeText(text)
}

export const getAvatarIdFromUserInput = (userInput: string): string | null => {
  let result = ''

  if (isUrl(userInput)) {
    const parsedResult = userInput.split('?')[0].split('/').pop()

    if (!parsedResult) {
      return null
    }

    result = parsedResult
  } else {
    result = userInput
  }

  if (result.substring(0, 5) !== 'avtr_') {
    return null
  }

  return result
}

export const mapFieldsForDatabase = (fields: {
  [key: string]: any
}): { [key: string]: any } =>
  Object.entries(fields).reduce(
    (newFields, [key, val]) => ({
      ...newFields,
      [key.toLowerCase()]: val,
    }),
    {}
  )

export const getIsVrchatWorldId = (value: string): boolean =>
  typeof value === 'string' && value.substring(0, 4) === 'wrld'

export function isVrchatAvatarUrl(url: string): boolean {
  return url.includes('vrchat.com/home/avatar')
}

export function isVrchatWorldUrl(url: string): boolean {
  return (
    url.includes('vrchat.com/home/world') ||
    url.includes('vrchat.com/home/launch?worldId')
  )
}

export function isTwitterUrl(url: string): boolean {
  return url.includes('twitter.com')
}

export function isPatreonUrl(url: string): boolean {
  return url.includes('patreon.com')
}

export function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com')
}

export function isDiscordUrl(url: string): boolean {
  return url.includes('discordapp.com') || url.includes('discord.com')
}

export const isItchProductUrl = (url: string): boolean => {
  try {
    const urlObject = new URL(url)

    if (urlObject.hostname.endsWith('itch.io')) {
      const parts = urlObject.hostname.split('.')
      return parts.length === 3 && urlObject.pathname.trim() !== '/'
    }

    return false
  } catch (error) {
    return false
  }
}

export const getImageUrlFromYouTubeUrl = (url: string): string =>
  isUrlAYoutubeVideo(url)
    ? `https://ytimg.googleusercontent.com/vi/${getYouTubeVideoIdFromUrl(
        url
      )}/sddefault.jpg`
    : ''

export const getExtensionFromUrl = (url: string): string => {
  if (!url) {
    return ''
  }

  const lastItemAfterDot = url.split('.').pop()

  if (
    !lastItemAfterDot ||
    (lastItemAfterDot.length !== 3 && lastItemAfterDot.length !== 4)
  ) {
    return ''
  }

  return lastItemAfterDot
}

export const isInternalUrl = (url: string): boolean =>
  url.includes('firebase') ||
  url.includes('googleapis') ||
  url.includes('supabase')

export const insertItemInbetweenAllItems = <TThing>(
  arr: Array<TThing>,
  thingToInsert: TThing
): Array<TThing> => {
  const newArr = [...arr]
  for (let i = arr.length - 1; i > 0; i--) {
    newArr.splice(i, 0, thingToInsert)
  }
  return newArr
}

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1)

export const moveItemToLeft = <T>(array: T[], indexToMove: number): T[] => {
  if (indexToMove === 0) {
    return array
  }
  const newArray = [...array]
  const newIndex = indexToMove - 1
  const item = newArray.splice(indexToMove, 1)[0]
  newArray.splice(newIndex, 0, item)
  return newArray
}

export const moveItemToRight = <T>(array: T[], indexToMove: number): T[] => {
  if (indexToMove === array.length - 1) {
    return array
  }
  const newArray = [...array]
  const newIndex = indexToMove + 1
  const item = newArray.splice(indexToMove, 1)[0]
  newArray.splice(newIndex, 0, item)
  return newArray
}

export function getIsStringADate(string: string): boolean {
  const date = new Date(string)
  // @ts-ignore
  return !isNaN(date) && date.toString() !== 'Invalid Date'
}

export const getDateFromString = (string: string): Date => new Date(string)

export const getIsUuid = (string: string): boolean => validateUuid(string)

export const findItemAndParents = <
  TItem extends { id: string; parent: string }
>(
  items: TItem[],
  id: string
): TItem[] => {
  const findItem = (items: TItem[], id: string): TItem[] => {
    let returnItems: TItem[] = []

    for (const item of items) {
      if (item.id === id) {
        console.log('MATCH!', id)

        returnItems.push(item)

        if (item.parent) {
          returnItems = returnItems.concat(findItem(items, item.parent))
        }
      }
    }
    return returnItems
  }

  return findItem(items, id) || []
}

// https://stackoverflow.com/a/2450976/1215393
export function shuffle<TArray extends Array<any>>(array: TArray): TArray {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

export const moveCursorToEnd = (element: HTMLElement) => {
  const range = document.createRange()
  const selection = window.getSelection()
  range.setStart(element, element.childNodes.length)
  range.collapse(true)
  // @ts-ignore
  selection.removeAllRanges()
  // @ts-ignore
  selection.addRange(range)
}

let isChristmasTime = new Date().getMonth() === 11

export const getIsChristmasTime = () => isChristmasTime

export const addOrUpdateQueryParam = (name: string, value: string): void => {
  const url = new URL(window.location.href)

  url.searchParams.set(name, value)

  console.debug(`addOrUpdateQueryParam`, { name, value, url: url.href })

  window.history.replaceState(null, '', url.href)
}
