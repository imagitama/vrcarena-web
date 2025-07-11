import { useLocalStorage } from '@rehooks/local-storage'

// TODO: Move to each module/component who cares about them
export const keys = {
  hiddenNotices: 'hiddenNotices',
  assetsSortByFieldName: 'assetsSortByFieldName',
  assetsSortByDirection: 'assetsSortByDirection',
  hiddenSpecialEventNames: 'hiddenSpecialEventNames',
  useTabbedAssetOverview: 'useTabbedAssetOverview',
  seenQueuedAssets: 'seenQueuedAssets',
}

/**
 * A hook that lets us tap into storage on the device (browser). Only local right now.
 */
function useStorage<TResult>(
  key: string | false
): [TResult | null, (newValue: TResult) => void, () => void]
function useStorage<TResult>(
  key: string | false,
  defaultValue: TResult
): [TResult, (newValue: TResult) => void, () => void]
function useStorage<TResult>(
  key: string | false,
  defaultValue?: TResult
): [TResult | null, (newValue: TResult) => void, () => void] {
  try {
    if (key === false) {
      return [null, () => undefined, () => undefined]
    }

    // @ts-ignore this 3rd party hook tries to encode/parse JSON for us NOT strings
    const [value, ...rest]: [TResult, (newValue: TResult) => void, () => void] =
      useLocalStorage(key)

    if (!value && defaultValue) {
      return [defaultValue, ...rest]
    }
    return [value, ...rest]
  } catch (err) {
    // handle legacy browsers or high-privacy browsers
    // todo: return isError?
    if (
      err instanceof Error &&
      err.message.includes('Cannot read properties of null')
    ) {
      return [null, () => undefined, () => undefined]
    }
    throw err
  }
}

export default useStorage
