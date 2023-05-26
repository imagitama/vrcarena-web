import { inDevelopment } from './environment'
import { CollectionNames, AnalyticsFieldNames, insertRecord } from './data-store'

export const trackAction = (category, action, payload) => {
  if (inDevelopment()) {
    console.debug('trackAction', category, action, payload)
    return
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: JSON.stringify(payload)
  })
}

export const trackInternalAction = async (category, action, parentTable, parentId, extraData = null) => {
  try {
    await insertRecord(CollectionNames.Analytics, {
      [AnalyticsFieldNames.category]: category,
      [AnalyticsFieldNames.action]: action,
      [AnalyticsFieldNames.parentTable]: parentTable,
      [AnalyticsFieldNames.parent]: parentId,
      [AnalyticsFieldNames.extraData]: extraData
    })
  } catch (err) {
    console.error(`Could not track internal action: ${err.message}`, err)
    // do not throw here as we do not want to break the UI because of analytics!
  }
}
