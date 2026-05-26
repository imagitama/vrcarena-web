import { DataStoreErrorCode } from "@/data-store";
import useDataStoreItemsSync, { QueryOptions } from "./useDataStoreItemsSync";

const useDataStoreItemSync =
  <TRecord extends Record<string, any>>(collectionName: string, id: string | false, options?: QueryOptions<TRecord>):
    [boolean, boolean, DataStoreErrorCode | null, TRecord | null] => {
    const [isSubscribing, isSubscribed, lastErrorCode, lastSyncResults] = useDataStoreItemsSync<TRecord>(collectionName, options)

    const lastSyncResultSingular = Array.isArray(lastSyncResults) && lastSyncResults.length ? lastSyncResults[0] : null

    return [isSubscribing, isSubscribed, lastErrorCode, lastSyncResultSingular]
  }

export default useDataStoreItemSync