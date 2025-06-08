import { inDevelopment } from './environment'
import { insertRecord } from './data-store'
import { SupabaseClient } from '@supabase/supabase-js'
import { AnalyticsEntry, CollectionNames } from './modules/analytics'

export const trackAction = (
  category: string,
  action: string,
  payload?: any
) => {
  if (inDevelopment()) {
    console.debug('trackAction', category, action, payload)
    return
  }

  // @ts-ignore
  window.gtag('event', action, {
    event_category: category,
    event_label: JSON.stringify(payload),
  })
}

export const trackInternalAction = async (
  supabase: SupabaseClient,
  category: string,
  action: string,
  parentTable: string,
  parentId: string,
  extraData: any = null
) => {
  try {
    await insertRecord<AnalyticsEntry, AnalyticsEntry>(
      supabase,
      CollectionNames.Analytics,
      {
        category: category,
        action: action,
        parenttable: parentTable,
        parent: parentId,
        extradata: extraData,
      }
    )
  } catch (err) {
    console.error(
      `Could not track internal action: ${(err as Error).message}`,
      err
    )
    // do not throw here as we do not want to break the UI because of analytics!
  }
}
