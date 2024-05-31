import { inDevelopment } from './environment'
import {
  CollectionNames,
  AnalyticsFieldNames,
  insertRecord,
} from './data-store'

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
  category: string,
  action: string,
  parentTable: string,
  parentId: string,
  extraData: any = null
) => {
  try {
    await insertRecord(CollectionNames.Analytics, {
      [AnalyticsFieldNames.category]: category,
      [AnalyticsFieldNames.action]: action,
      [AnalyticsFieldNames.parentTable]: parentTable,
      [AnalyticsFieldNames.parent]: parentId,
      [AnalyticsFieldNames.extraData]: extraData,
    })
  } catch (err) {
    console.error(
      `Could not track internal action: ${(err as Error).message}`,
      err
    )
    // do not throw here as we do not want to break the UI because of analytics!
  }
}
